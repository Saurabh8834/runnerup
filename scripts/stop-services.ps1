$ErrorActionPreference = "SilentlyContinue"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$LogsDir = Join-Path $RepoRoot "logs"
$PidFile = Join-Path $LogsDir "daemon.pid"

Write-Host "Stopping Runner Up services..." -ForegroundColor Cyan

# 1. Stop Daemon if running
if (Test-Path $PidFile) {
    $dpid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($dpid) {
        Stop-Process -Id $dpid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped daemon PID $dpid" -ForegroundColor Green
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# 2. Stop cloudflared
$cf = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cf) {
    $cf | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped cloudflared processes" -ForegroundColor Green
}

# 3. Stop backend on port 4000
$conns = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    if ($c.OwningProcess) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process on port 4000 (PID $($c.OwningProcess))" -ForegroundColor Green
    }
}

Write-Host "[DONE] All Runner Up services stopped." -ForegroundColor Green
