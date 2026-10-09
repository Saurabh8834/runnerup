@echo off
setlocal
title Runner Up - Service Status
echo ========================================================
echo               RUNNER UP - LIVE STATUS CHECK
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0scripts\check-status.ps1'"

echo.
pause
