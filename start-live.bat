@echo off
title Runner Up - Live Server Launcher
echo ========================================================
echo   Starting Runner Up (Backend, Frontend, and Cloudflare)
echo ========================================================

echo.
echo [1/3] Starting Backend API on port 4000...
start "Runner Up - Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Starting Next.js Frontend on port 3000...
start "Runner Up - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Tunnel for runnerup.in...
if exist "%USERPROFILE%\cloudflared.exe" (
    start "Runner Up - Cloudflare Tunnel" cmd /k ""%USERPROFILE%\cloudflared.exe" tunnel --config "%~dp0cloudflared-config.yml" run"
) else (
    start "Runner Up - Cloudflare Tunnel" cmd /k "cloudflared tunnel --config "%~dp0cloudflared-config.yml" run"
)

echo.
echo ========================================================
echo   All 3 services launched!
echo   Website URL: https://runnerup.in
echo   Local Frontend: http://localhost:3000
echo   Backend API:   http://localhost:4000
echo ========================================================
pause
