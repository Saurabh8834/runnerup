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
    Write-Output $line
}

# 1. Comprehensive Windows Power Scheme: Prevent Sleep, Hibernate, and Wi-Fi throttling
function Apply-PowerSettings {
    try {
        # Lid Close Action: 0 = Do Nothing
        powercfg /setacvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0 2>&1 | Out-Null
        powercfg /setdcvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0 2>&1 | Out-Null

        # System Sleep Timeout: 0 = Never
        powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0 2>&1 | Out-Null
        powercfg /setdcvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0 2>&1 | Out-Null

        # System Hibernate Timeout: 0 = Never
        powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HIBERNATEIDLE 0 2>&1 | Out-Null
        powercfg /setdcvalueindex SCHEME_CURRENT SUB_SLEEP HIBERNATEIDLE 0 2>&1 | Out-Null

        # Wireless Adapter Power Saving: 0 = Maximum Performance
        powercfg /setacvalueindex SCHEME_CURRENT 19cbb8fa-5279-450e-9fac-8a3d5fedd0c1 12bbebe6-58d6-4636-95bb-3217ef867c1a 0 2>&1 | Out-Null
        powercfg /setdcvalueindex SCHEME_CURRENT 19cbb8fa-5279-450e-9fac-8a3d5fedd0c1 12bbebe6-58d6-4636-95bb-3217ef867c1a 0 2>&1 | Out-Null

        # Connectivity in Standby: 1 = Always On
        powercfg /setacvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1 2>&1 | Out-Null
        powercfg /setdcvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1 2>&1 | Out-Null

        powercfg /SetActive SCHEME_CURRENT 2>&1 | Out-Null
        Write-DaemonLog "Power policy verified: Lid close = Do Nothing, Sleep = Never, Wi-Fi = Max Performance."
    } catch {
        Write-DaemonLog "Notice: Could not set power settings: $_"
    }
}

Apply-PowerSettings

try {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class PowerManagement {
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern uint SetThreadExecutionState(uint esFlags);
    }
"@ -ErrorAction SilentlyContinue
    # ES_CONTINUOUS (0x80000000) | ES_SYSTEM_REQUIRED (0x00000001) | ES_AWAYMODE_REQUIRED (0x00000040)
    [PowerManagement]::SetThreadExecutionState([uint32]2147483713) | Out-Null
    Write-DaemonLog "Power sleep prevention engaged (ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE)."
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

    # Prefer compiled production server dist/server.js for lower RAM and no watcher lag
    $serverDist = Join-Path $BackendDir "dist\server.js"
    $arg = if (Test-Path $serverDist) { "/c node dist/server.js" } else { "/c npm run dev" }

    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList @($arg) `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput $BackendLog `
        -RedirectStandardError $BackendErrLog `
        -WindowStyle Hidden `
        -PassThru
    return $proc
}

function Start-TunnelProcess {
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
$script:consecutiveEdgeFails = 0

while ($true) {
    Start-Sleep -Seconds 5
    $cycle++

    # Periodically re-assert execution state to keep Windows from sleeping
    if ($cycle % 12 -eq 0) {
        try {
            [PowerManagement]::SetThreadExecutionState([uint32]2147483713) | Out-Null
        } catch {}
    }

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
        $script:backendGraceCycles = 0
    }

    # Cloudflare Tunnel check: process alive?
    if ($null -eq $TunnelProc -or $TunnelProc.HasExited) {
        Write-DaemonLog "Watchdog: Cloudflare Tunnel process exited. Restarting..."
        $TunnelProc = Start-TunnelProcess
        $script:consecutiveEdgeFails = 0
    }

    # Frontend check if enabled
    if ($IncludeFrontend -and ($null -eq $FrontendProc -or $FrontendProc.HasExited)) {
        Write-DaemonLog "Watchdog: Frontend exited. Restarting..."
        $FrontendProc = Start-FrontendProcess
    }

    # Active Edge Probe: Check public endpoint every 20 seconds (every 4 cycles)
    if ($cycle % 4 -eq 0 -and $portActive) {
        # First verify local internet connectivity before blaming tunnel
        $hasInternet = $true
        try {
            $dnsTest = [System.Net.Dns]::GetHostAddresses("1.1.1.1")
            if (-not $dnsTest) { $hasInternet = $false }
        } catch {
            $hasInternet = $false
        }

        if ($hasInternet) {
            $edgeOk = $false
            try {
                $resp = Invoke-WebRequest -Uri "https://api.runnerup.in/health" -TimeoutSec 6 -UseBasicParsing -ErrorAction Stop
                if ($resp.StatusCode -eq 200) {
                    $edgeOk = $true
                    $script:consecutiveEdgeFails = 0
                }
            } catch {
                $edgeOk = $false
            }

            if (-not $edgeOk) {
                $script:consecutiveEdgeFails++
                Write-DaemonLog "Watchdog: Public edge probe failed (attempt $script:consecutiveEdgeFails / 4)"
                # Allow 4 failures (80 seconds) before recycling to avoid thrashing during momentary Wi-Fi blips
                if ($script:consecutiveEdgeFails -ge 4) {
                    Write-DaemonLog "Watchdog: Public API (https://api.runnerup.in) unreachable for 80s while internet is online. Recycling tunnel..."
                    try {
                        if ($TunnelProc -and -not $TunnelProc.HasExited) {
                            Stop-Process -Id $TunnelProc.Id -Force -ErrorAction SilentlyContinue
                        }
                    } catch {}
                    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 1
                    $TunnelProc = Start-TunnelProcess
                    $script:consecutiveEdgeFails = 0
                }
            }
        } else {
            # Network temporarily down (e.g. Wi-Fi re-associating after lid reopen)
            # Cloudflared will self-heal once Wi-Fi reconnects; do NOT thrash tunnel
            $script:consecutiveEdgeFails = 0
        }
    }

    # Every 60 seconds, check local health endpoint
    if ($cycle % 12 -eq 0) {
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:4000/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        } catch {
            Write-DaemonLog "Warning: Local health check failed: $($_.Exception.Message)"
        }
    }
}
