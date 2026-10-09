@echo off
setlocal
title Runner Up - Install Windows Auto-Start
echo ========================================================
echo        INSTALL RUNNER UP WINDOWS AUTO-START
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\install-autostart.ps1'"

echo.
pause
