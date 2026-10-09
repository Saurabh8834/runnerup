@echo off
setlocal
title Runner Up - Stop Services
echo ========================================================
echo              STOPPING RUNNER UP SERVICES
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\stop-services.ps1'"

echo.
pause
