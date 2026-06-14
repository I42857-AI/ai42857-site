Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell -ExecutionPolicy Bypass -File """ & Replace(WScript.ScriptFullName, "Dashboard-TuoPan-Hidden.vbs", "Dashboard-TuoPan.ps1") & """", 0, False
