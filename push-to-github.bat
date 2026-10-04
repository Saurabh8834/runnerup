@echo off
title Push Runner Up to GitHub (Saurabh8834)
cd /d "%~dp0"
echo ========================================================
echo   Pushing code to https://github.com/Saurabh8834/runnerup
echo ========================================================
echo.
echo If prompted, please authorize GitHub in your browser.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! Your code has been uploaded to GitHub:
    echo   https://github.com/Saurabh8834/runnerup
    echo ========================================================
) else (
    echo ========================================================
    echo   Push encountered an error. See above details.
    echo ========================================================
)
echo.
pause
