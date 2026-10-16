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

# 1. Engage sleep prevention and configure laptop lid to NEVER sleep when closed
try {
    # Set Lid Close action to "Do Nothing" (0) and keep Wi-Fi active in standby
    powercfg /setacvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0 2>&1 | Out-Null
    powercfg /setdcvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0 2>&1 | Out-Null
    powercfg /setacvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1 2>&1 | Out-Null
    powercfg /setdcvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1 2>&1 | Out-Null
    powercfg /SetActive SCHEME_CURRENT 2>&1 | Out-Null
    Write-DaemonLog "Configured Windows Power Scheme: Lid close action set to 'Do Nothing' (0) and standby network enabled."
} catch {
    Write-DaemonLog "Notice: Could not set lid close power settings: $_"
}

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
    Write-DaemonLog "Verifying and provisioning DNS route for api.runnerup.in..."
    try {
        & $CloudflaredExe tunnel route dns -f "8bfe691c-7440-49a8-9c5c-620a1bd3dafe" "api.runnerup.in" 2>&1 | Out-Null
    } catch {}

    Write-DaemonLog "Starting Cloudflare Tunnel (HTTP/2 with 10s heartbeat)..."
    $proc = Start-Process -FilePath $CloudflaredExe `
        -ArgumentList @("tunnel", "--config", $ConfigYaml, "--protocol", "http2", "--heartbeat-interval", "10s", "--heartbeat-count", "3", "run") `
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

    # Cloudflare Tunnel check: process alive?
    if ($null -eq $TunnelProc -or $TunnelProc.HasExited) {
        Write-DaemonLog "Watchdog: Cloudflare Tunnel exited. Restarting..."
        $TunnelProc = Start-TunnelProcess
        $script:tunnelFailCount = 0
    }

    # Frontend check if enabled
    if ($IncludeFrontend -and ($null -eq $FrontendProc -or $FrontendProc.HasExited)) {
        Write-DaemonLog "Watchdog: Frontend exited. Restarting..."
        $FrontendProc = Start-FrontendProcess
    }

    # Active Edge Probe: Check public endpoint every 15 seconds (every 3 cycles)
    if ($cycle % 3 -eq 0 -and $portActive) {
        $edgeOk = $false
        try {
            $resp = Invoke-WebRequest -Uri "https://api.runnerup.in/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $edgeOk = $true
                $script:tunnelFailCount = 0
            }
        } catch {
            $edgeOk = $false
        }

        if (-not $edgeOk) {
            $script:tunnelFailCount = [int]$script:tunnelFailCount + 1
            Write-DaemonLog "Watchdog: Public edge probe failed (consecutive failures: $script:tunnelFailCount)"
            if ($script:tunnelFailCount -ge 2) {
                Write-DaemonLog "Watchdog: Public API (https://api.runnerup.in) unreachable. Recycling Cloudflare Tunnel..."
                try {
                    if ($TunnelProc -and -not $TunnelProc.HasExited) {
                        Stop-Process -Id $TunnelProc.Id -Force -ErrorAction SilentlyContinue
                    }
                } catch {}
                Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
                $TunnelProc = Start-TunnelProcess
                $script:tunnelFailCount = 0
            }
        }
    }

    # Every 60 seconds, check local health endpoint
    if ($cycle % 12 -eq 0) {
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:4000/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -ne 200) {
                Write-DaemonLog "Warning: Local health endpoint returned $($resp.StatusCode)"
            }
        } catch {
            Write-DaemonLog "Warning: Local health check failed: $($_.Exception.Message)"
        }
    }
}

