@echo off
title Runner Up - Prevent Sleep on Laptop Lid Close
echo ========================================================
echo     Configuring Laptop to NEVER Sleep When Lid is Closed
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "powercfg /setacvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0; powercfg /setdcvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 5ca83367-6e45-459f-a27b-476b1d01c936 0; powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0; powercfg /setdcvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0; powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HIBERNATEIDLE 0; powercfg /setdcvalueindex SCHEME_CURRENT SUB_SLEEP HIBERNATEIDLE 0; powercfg /setacvalueindex SCHEME_CURRENT 19cbb8fa-5279-450e-9fac-8a3d5fedd0c1 12bbebe6-58d6-4636-95bb-3217ef867c1a 0; powercfg /setdcvalueindex SCHEME_CURRENT 19cbb8fa-5279-450e-9fac-8a3d5fedd0c1 12bbebe6-58d6-4636-95bb-3217ef867c1a 0; powercfg /setacvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1; powercfg /setdcvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 1; powercfg /SetActive SCHEME_CURRENT"

echo.
echo [SUCCESS] Windows Power Scheme updated permanently!
echo - Lid close action set to: DO NOTHING (AC and Battery)
echo - Sleep timeout set to: NEVER (AC and Battery)
echo - Hibernate timeout set to: NEVER (AC and Battery)
echo - Wi-Fi Power Saving set to: MAXIMUM PERFORMANCE
echo - Network connectivity in standby set to: ALWAYS ON
echo.
echo Your laptop will now keep running the RunnerUp backend & tunnel
echo continuously even when the laptop lid is closed.
echo.
pause
