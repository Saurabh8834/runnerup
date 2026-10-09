# Runner Up - Persistent Background Supervisor Daemon
# Keeps Backend API (port 4000) and Cloudflare Tunnel online continuously with auto-restart.

param(
    [switch]$IncludeFrontend = $false
)

$ErrorActionPreference = "Continue"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"
$LogsDir = Join-Path $RepoRoot "logs"
$PidFile = Join-Path $LogsDir "daemon.pid"
$ConfigYaml = Join-Path $RepoRoot "cloudflared-config.yml"

if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

$DaemonLog       = Join-Path $LogsDir "daemon.log"
$BackendLog      = Join-Path $LogsDir "backend.log"
$BackendErrLog   = Join-Path $LogsDir "backend.err.log"
$TunnelLog       = Join-Path $LogsDir "cloudflared.log"
$TunnelErrLog    = Join-Path $LogsDir "cloudflared.err.log"
$FrontendLog     = Join-Path $LogsDir "frontend.log"
$FrontendErrLog  = Join-Path $LogsDir "frontend.err.log"

function Write-DaemonLog {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $Message"
    Add-Content -Path $DaemonLog -Value $line -Encoding UTF8
}

# 1. Engage sleep prevention so Windows doesn't sleep while acting as a server
try {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class PowerManagement {
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern uint SetThreadExecutionState(uint esFlags);
    }
"@ -ErrorAction SilentlyContinue
    # ES_CONTINUOUS (0x80000000) | ES_SYSTEM_REQUIRED (0x00000001) = 2147483649
    [PowerManagement]::SetThreadExecutionState([uint32]2147483649) | Out-Null
    Write-DaemonLog "Power sleep prevention engaged (ES_CONTINUOUS | ES_SYSTEM_REQUIRED)."
} catch {
    Write-DaemonLog "Notice: Could not set sleep flags: $_"
}

# 2. Locate cloudflared.exe
$CloudflaredExe = ""
$userCloudflared = Join-Path $env:USERPROFILE "cloudflared.exe"
if (Test-Path $userCloudflared) {
    $CloudflaredExe = $userCloudflared
} else {
    $found = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($found) {
        $CloudflaredExe = $found.Source
    }
}

if (-not $CloudflaredExe) {
    Write-DaemonLog "CRITICAL: cloudflared.exe not found at $userCloudflared or in PATH. Exiting."
    exit 1
}

# Save current Daemon PID
$PID | Out-File -FilePath $PidFile -Encoding ascii -Force
Write-DaemonLog "Daemon started (PID: $PID). Root: $RepoRoot"

function Clean-Port4000 {
    try {
        $conns = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            if ($c.OwningProcess -and $c.OwningProcess -ne $PID) {
                Write-DaemonLog "Clearing lingering process on port 4000 (PID: $($c.OwningProcess))"
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

# Clean any existing stale instances
Clean-Port4000
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$BackendProc = $null
$TunnelProc = $null
$FrontendProc = $null

function Start-BackendProcess {
    Write-DaemonLog "Starting Backend API (port 4000)..."
    Clean-Port4000
    Start-Sleep -Milliseconds 500

    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @("/c", "npm run dev") `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput $BackendLog `
        -RedirectStandardError $BackendErrLog `
        -WindowStyle Hidden `
        -PassThru
    return $proc
}

function Start-TunnelProcess {
    Write-DaemonLog "Starting Cloudflare Tunnel..."
    $proc = Start-Process -FilePath $CloudflaredExe `
        -ArgumentList @("tunnel", "--config", $ConfigYaml, "run") `
        -WorkingDirectory $RepoRoot `
        -RedirectStandardOutput $TunnelLog `
        -RedirectStandardError $TunnelErrLog `
        -WindowStyle Hidden `
        -PassThru
    return $proc
}

function Start-FrontendProcess {
    Write-DaemonLog "Starting Next.js Frontend (port 3000)..."
    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @("/c", "npm run dev") `
        -WorkingDirectory $FrontendDir `
        -RedirectStandardOutput $FrontendLog `
        -RedirectStandardError $FrontendErrLog `
        -WindowStyle Hidden `
        -PassThru
    return $proc
}

# Launch initial processes
$BackendProc = Start-BackendProcess
$script:backendGraceCycles = 6
Start-Sleep -Seconds 3
$TunnelProc = Start-TunnelProcess
if ($IncludeFrontend) {
    $FrontendProc = Start-FrontendProcess
}

# Supervise loop
$cycle = 0
while ($true) {
    Start-Sleep -Seconds 5
    $cycle++

    # Backend check: process alive or port 4000 listening
    $portActive = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
    $backendDead = ($null -eq $BackendProc -or $BackendProc.HasExited)

    if ($backendDead) {
        Write-DaemonLog "Watchdog: Backend process exited. Restarting..."
        $BackendProc = Start-BackendProcess
        $script:backendGraceCycles = 6
    } elseif (-not $portActive) {
        if ($script:backendGraceCycles -gt 0) {
            $script:backendGraceCycles--
            # Backend is still warming up, allow grace period
        } else {
            Write-DaemonLog "Watchdog: Backend process alive but port 4000 unresponsive after grace period. Restarting..."
            try {
                if ($BackendProc -and -not $BackendProc.HasExited) {
                    Stop-Process -Id $BackendProc.Id -Force -ErrorAction SilentlyContinue
                }
            } catch {}
            $BackendProc = Start-BackendProcess
            $script:backendGraceCycles = 6
        }
    } else {
        # Backend is healthy and listening on 4000
        $script:backendGraceCycles = 0
    }

    # Cloudflare Tunnel check
    if ($null -eq $TunnelProc -or $TunnelProc.HasExited) {
        Write-DaemonLog "Watchdog: Cloudflare Tunnel exited. Restarting..."
        $TunnelProc = Start-TunnelProcess
    }

    # Frontend check if enabled
    if ($IncludeFrontend -and ($null -eq $FrontendProc -or $FrontendProc.HasExited)) {
        Write-DaemonLog "Watchdog: Frontend exited. Restarting..."
        $FrontendProc = Start-FrontendProcess
    }

    # Every 60 seconds, check local health endpoint
    if ($cycle % 12 -eq 0) {
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:4000/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -ne 200) {
                Write-DaemonLog "Warning: Health endpoint returned $($resp.StatusCode)"
            }
        } catch {
            Write-DaemonLog "Warning: Health check failed: $($_.Exception.Message)"
        }
    }
}
