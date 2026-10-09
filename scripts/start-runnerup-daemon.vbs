' Runner Up - Silent Launcher for Background Supervisor
' Runs the PowerShell daemon with no visible command window.
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strPs1 = objFSO.BuildPath(strScriptDir, "runnerup-daemon.ps1")

strCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ""& '" & strPs1 & "'"""
objShell.Run strCmd, 0, False
