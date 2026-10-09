$ErrorActionPreference = "SilentlyContinue"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$LogsDir = Join-Path $RepoRoot "logs"
$PidFile = Join-Path $LogsDir "daemon.pid"

# 1. Daemon process status
$daemonRunning = $false
if (Test-Path $PidFile) {
    $dpid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($dpid) {
        $dproc = Get-Process -Id $dpid -ErrorAction SilentlyContinue
        if ($dproc) {
            $daemonRunning = $true
            Write-Host "[OK] Supervisor Daemon is RUNNING (PID: $dpid)" -ForegroundColor Green
        }
    }
}
if (-not $daemonRunning) {
    Write-Host "[!] Supervisor Daemon is NOT running." -ForegroundColor Yellow
}

# 2. Backend Port 4000
$port4000 = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
if ($port4000) {
    $pids = ($port4000 | Select-Object -ExpandProperty OwningProcess -Unique) -join ", "
    Write-Host "[OK] Backend API is LISTENING on port 4000 (PID: $pids)" -ForegroundColor Green
} else {
    Write-Host "[ERR] Backend API is NOT running on port 4000" -ForegroundColor Red
}

# 3. Cloudflare Tunnel process
$cfProcs = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cfProcs) {
    $cfPids = ($cfProcs | Select-Object -ExpandProperty Id) -join ", "
    Write-Host "[OK] Cloudflare Tunnel process is RUNNING (PID: $cfPids)" -ForegroundColor Green
} else {
    Write-Host "[ERR] Cloudflare Tunnel process is NOT running" -ForegroundColor Red
}

# 4. PostgreSQL (Port 5432)
$port5432 = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if ($port5432) {
    Write-Host "[OK] PostgreSQL Database is ACTIVE on port 5432" -ForegroundColor Green
} else {
    Write-Host "[ERR] PostgreSQL is NOT active on port 5432" -ForegroundColor Red
}

# 5. Live public API health check
Write-Host ""
Write-Host "Testing live public endpoint (https://api.runnerup.in/health)..." -ForegroundColor Cyan
try {
    $curlOutput = curl.exe -s --max-time 10 https://api.runnerup.in/health
    if ($curlOutput -match '"status":"ok"') {
        Write-Host "[SUCCESS] https://api.runnerup.in/health responded 200 OK!" -ForegroundColor Green
        Write-Host "Response: $curlOutput" -ForegroundColor DarkGray
    } else {
        Write-Host "[FAIL] Response: $curlOutput" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Error testing health: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Windows Sleep Setting check
Write-Host ""
$pcfg = powercfg /q | Select-String "STANDBYIDLE" -Context 0, 5
if ($pcfg -match "0x00000000") {
    Write-Host "[OK] Sleep Timeout (AC) is set to NEVER (optimal for hosting)." -ForegroundColor Green
} else {
    Write-Host "[INFO] Windows AC Sleep Timeout is active. The daemon prevents sleep while running." -ForegroundColor Yellow
}
