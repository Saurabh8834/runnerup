@echo off
setlocal
title Runner Up - Live Manager
cls
echo ========================================================
echo               RUNNER UP - LIVE CONTROLLER
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\check-status.ps1'"

echo.
echo --------------------------------------------------------
echo Choose an option:
echo   [1] Start Background Service (Silent, Auto-Restarting)
echo   [2] Stop Background Service
echo   [3] Refresh Status
echo   [4] View Logs (Backend & Cloudflare)
echo   [5] Launch Interactive Windows (Old method with 3 CMDs)
echo   [6] Exit
echo --------------------------------------------------------
set /p choice="Enter choice (1-6) [default: 1]: "

if "%choice%"=="" set choice=1
if "%choice%"=="1" goto start_daemon
if "%choice%"=="2" goto stop_daemon
if "%choice%"=="3" goto refresh
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto old_start
if "%choice%"=="6" goto end
goto refresh

:start_daemon
cls
echo Starting Runner Up background supervisor...
wscript.exe "%~dp0scripts\start-runnerup-daemon.vbs"
timeout /t 3 /nobreak >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\check-status.ps1'"
echo.
echo Background supervisor is running! You can close this window.
pause
goto end

:stop_daemon
cls
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\stop-services.ps1'"
pause
goto end

:refresh
cls
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\check-status.ps1'"
pause
goto end

:view_logs
cls
echo Recent Backend Logs:
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path '%~dp0logs\backend.log') { Get-Content '%~dp0logs\backend.log' -Tail 15 } else { 'No backend log yet.' }"
echo.
echo Recent Cloudflare Tunnel Logs:
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path '%~dp0logs\cloudflared.err.log') { Get-Content '%~dp0logs\cloudflared.err.log' -Tail 15 } else { 'No tunnel log yet.' }"
echo.
pause
goto end

:old_start
echo Starting 3 interactive windows...
start "Runner Up - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"
start "Runner Up - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul
if exist "%USERPROFILE%\cloudflared.exe" (
    start "Runner Up - Cloudflare Tunnel" cmd /k ""%USERPROFILE%\cloudflared.exe" tunnel --config "%~dp0cloudflared-config.yml" run"
) else (
    start "Runner Up - Cloudflare Tunnel" cmd /k "cloudflared tunnel --config "%~dp0cloudflared-config.yml" run"
)
goto end

:end
