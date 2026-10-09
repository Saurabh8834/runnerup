@echo off
setlocal
title Runner Up - Background Service Starter
echo ========================================================
echo        STARTING RUNNER UP BACKGROUND SERVICE
echo ========================================================
echo.
echo Launching silent background supervisor...
wscript.exe "%~dp0scripts\start-runnerup-daemon.vbs"

echo Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\check-status.ps1'"

echo.
echo ========================================================
echo   Services are running in the background!
echo   You can close this window at any time.
echo   Check status anytime by running: check-status.bat
echo   Stop services anytime by running: stop-service.bat
echo ========================================================
echo.
pause
