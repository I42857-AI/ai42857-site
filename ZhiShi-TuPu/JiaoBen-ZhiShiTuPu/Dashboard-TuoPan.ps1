<#
    Dashboard-TuoPan.ps1 - Dashboard System Tray Launcher (Multi-Instance)
    All Chinese strings loaded from Dashboard-TuoPan-Res.json at runtime.
    This script contains ONLY ASCII characters to avoid encoding issues.

    Architecture:
    - Each project gets its own vite instance on a unique port (5173+)
    - Multiple projects can run simultaneously in separate browser tabs
    - Switching projects does NOT close previously opened projects
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
public class WinForeGround {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    public const int SW_RESTORE = 9;

    [DllImport("user32.dll")]
    public static extern IntPtr FindWindowEx(IntPtr hWndParent, IntPtr hWndChildAfter, string lpszClass, string lpszWindow);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    public const int GWL_EXSTYLE = -20;
    public const int WS_EX_TOPMOST = 0x00000008;

    public static List<IntPtr> FindTopMostWindowsByPid(uint pid) {
        var result = new List<IntPtr>();
        IntPtr hWnd = IntPtr.Zero;
        while ((hWnd = FindWindowEx(IntPtr.Zero, hWnd, null, null)) != IntPtr.Zero) {
            uint winPid;
            GetWindowThreadProcessId(hWnd, out winPid);
            if (winPid == pid) {
                int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
                if ((exStyle & WS_EX_TOPMOST) != 0) {
                    result.Add(hWnd);
                }
            }
        }
        return result;
    }

    public static bool RemoveTopMost(IntPtr hWnd) {
        int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
        if ((exStyle & WS_EX_TOPMOST) != 0) {
            SetWindowLong(hWnd, GWL_EXSTYLE, exStyle & ~WS_EX_TOPMOST);
            return true;
        }
        return false;
    }

    public static bool RestoreTopMost(IntPtr hWnd) {
        int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
        SetWindowLong(hWnd, GWL_EXSTYLE, exStyle | WS_EX_TOPMOST);
        return true;
    }
}
"@

$script:runningServers = @{}
$script:notifyIcon = $null
$script:projectRoot = $null
$script:res = $null
$script:basePort = 5173

function Load-Resources {
    param([string]$ScriptDir)
    $resFile = Join-Path $ScriptDir "Dashboard-TuoPan-Res.json"
    if (-not (Test-Path $resFile)) {
        Write-Host "[ERROR] Resource file not found: $resFile" -ForegroundColor Red
        return $null
    }
    try {
        $json = [System.IO.File]::ReadAllText($resFile, [System.Text.Encoding]::UTF8)
        return $json | ConvertFrom-Json
    }
    catch {
        Write-Host "[ERROR] Failed to parse resource file: $_" -ForegroundColor Red
        return $null
    }
}

function Find-ProjectRoot {
    $drives = Get-PSDrive -PSProvider FileSystem | Sort-Object -Property Name
    foreach ($drive in $drives) {
        $candidate = Join-Path $drive.Root "XiangMu-KongJian"
        if (Test-Path $candidate) {
            $checks = @(
                (Test-Path (Join-Path $candidate "skills")),
                (Test-Path (Join-Path $candidate "TRAE")),
                (Test-Path (Join-Path $candidate "QClaw"))
            )
            if (($checks | Where-Object { $_ -eq $true }).Count -ge 2) {
                return $candidate
            }
        }
    }
    return $null
}

function Find-NodeDir {
    param([string]$Root)
    $nodeDir = (Get-ChildItem "$Root\node\node-v*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
    return $nodeDir
}

function Get-ProjectList {
    param([string]$Root)
    # ZhiShi-TuPu is under PC\ (sibling of XiangMu-KongJian on same drive)
    $pcDir = Join-Path ([System.IO.Path]::GetPathRoot($Root)) "PC"
    $tuPuDir = Join-Path $pcDir "ZhiShi-TuPu"
    if (-not (Test-Path $tuPuDir)) { return @() }

    $projects = @()
    $dirs = Get-ChildItem $tuPuDir -Directory -ErrorAction SilentlyContinue
    foreach ($dir in $dirs) {
        $graphFile = Join-Path $dir.FullName ".understand-anything\knowledge-graph.json"
        if (Test-Path $graphFile) {
            $projects += @{
                Name     = $dir.Name
                GraphDir = $dir.FullName
            }
        }
    }
    return $projects
}

function Get-NextAvailablePort {
    $port = $script:basePort
    $usedPorts = @($script:runningServers.Values | ForEach-Object { $_.Port })
    while ($usedPorts -contains $port) {
        $port++
    }
    return $port
}

function Start-DashboardServer {
    param(
        [string]$ProjectName,
        [string]$GraphDir,
        [string]$DashboardDir,
        [string]$NodeDir
    )

    if ($script:runningServers.ContainsKey($ProjectName)) {
        $info = $script:runningServers[$ProjectName]
        Start-Process "http://127.0.0.1:$($info.Port)/"
        Start-Sleep -Milliseconds 500
        Bring-BrowserToFront
        return
    }

    if (-not (Test-Path $DashboardDir)) {
        $msg = $script:res.dialog.dirNotFound -replace '\{0\}', $DashboardDir
        [System.Windows.Forms.MessageBox]::Show(
            $msg,
            "Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $port = Get-NextAvailablePort

    $envPath = $env:PATH
    if ($NodeDir) {
        $envPath = "$NodeDir;$envPath"
    }

    $vbsFile = Join-Path $env:TEMP "ua-dashboard-$ProjectName-$port.vbs"
    $vbsContent = @"
Set objShell = CreateObject("WScript.Shell")
objShell.Environment("Process").Item("GRAPH_DIR") = "$GraphDir"
objShell.Environment("Process").Item("PATH") = "$envPath"
objShell.CurrentDirectory = "$DashboardDir"
objShell.Run "cmd /c call node_modules\.bin\vite.CMD --host 127.0.0.1 --port $port --no-open", 0, False
"@
    [System.IO.File]::WriteAllText($vbsFile, $vbsContent, [System.Text.Encoding]::ASCII)

    $proc = Start-Process "wscript.exe" -ArgumentList "//nologo", $vbsFile -PassThru

    $script:runningServers[$ProjectName] = @{
        Process   = $proc
        VbsFile   = $vbsFile
        GraphDir  = $GraphDir
        Port      = $port
        StartTime = Get-Date
    }

    Write-Host "  [START] $ProjectName on port $port" -ForegroundColor Cyan

    Start-Sleep -Milliseconds 3000

    Start-Process "http://127.0.0.1:$port/"

    Start-Sleep -Milliseconds 500
    Bring-BrowserToFront

    Update-TrayMenu
}

function Stop-DashboardServer {
    param([string]$ProjectName)

    if (-not $script:runningServers.ContainsKey($ProjectName)) { return }

    $info = $script:runningServers[$ProjectName]
    $port = $info.Port

    $viteProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($viteProc in $viteProcs) {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($viteProc.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdLine -and $cmdLine -match "vite" -and $cmdLine -match "--port $port") {
                Stop-Process -Id $viteProc.Id -Force
                Write-Host "  [STOP] Vite PID $($viteProc.Id) (port $port) for $ProjectName"
            }
        }
        catch { }
    }

    try {
        if ($info.Process -and -not $info.Process.HasExited) {
            Stop-Process -Id $info.Process.Id -Force -ErrorAction SilentlyContinue
        }
    }
    catch { }

    if (Test-Path $info.VbsFile) {
        Remove-Item $info.VbsFile -Force -ErrorAction SilentlyContinue
    }

    $script:runningServers.Remove($ProjectName)
    Update-TrayMenu
}

function Stop-AllDashboards {
    $keys = @($script:runningServers.Keys)
    foreach ($key in $keys) {
        Stop-DashboardServer -ProjectName $key
    }
}

function Update-TrayMenu {
    $menu = New-Object System.Windows.Forms.ContextMenuStrip

    $launchItem = New-Object System.Windows.Forms.ToolStripMenuItem($script:res.menu.launch)
    $launchItem.Font = New-Object System.Drawing.Font("Microsoft YaHei", 9, [System.Drawing.FontStyle]::Bold)

    $projects = Get-ProjectList -Root $script:projectRoot
    foreach ($proj in $projects) {
        $projItem = New-Object System.Windows.Forms.ToolStripMenuItem($proj.Name)
        $isRunning = $script:runningServers.ContainsKey($proj.Name)
        if ($isRunning) {
            $port = $script:runningServers[$proj.Name].Port
            $projItem.Text = "$($proj.Name) [$($script:res.menu.current) :$port]"
            $projItem.ForeColor = [System.Drawing.Color]::Green
        }
        $projItem.Tag = $proj
        $projItem.Add_Click({
                $p = $this.Tag
                $nodeDir = Find-NodeDir -Root $script:projectRoot
                $pcDir = Join-Path ([System.IO.Path]::GetPathRoot($script:projectRoot)) "PC"
                $dashDir = Join-Path $pcDir "Understand-Anything-main\understand-anything-plugin\packages\dashboard"
                Start-DashboardServer -ProjectName $p.Name -GraphDir $p.GraphDir -DashboardDir $dashDir -NodeDir $nodeDir
            })
        $launchItem.DropDownItems.Add($projItem) | Out-Null
    }

    if ($projects.Count -eq 0) {
        $emptyItem = New-Object System.Windows.Forms.ToolStripMenuItem($script:res.menu.noProjects)
        $emptyItem.Enabled = $false
        $launchItem.DropDownItems.Add($emptyItem) | Out-Null
    }

    $menu.Items.Add($launchItem) | Out-Null
    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    if ($script:runningServers.Count -gt 0) {
        $stopItem = New-Object System.Windows.Forms.ToolStripMenuItem($script:res.menu.stopAll)
        $stopItem.Add_Click({
                Stop-AllDashboards
            })
        $menu.Items.Add($stopItem) | Out-Null

        foreach ($key in $script:runningServers.Keys) {
            $port = $script:runningServers[$key].Port
            $stopOneItem = New-Object System.Windows.Forms.ToolStripMenuItem("$($script:res.menu.stopOne): $key :$port")
            $stopOneItem.Tag = $key
            $stopOneItem.Add_Click({
                    Stop-DashboardServer -ProjectName $this.Tag
                })
            $menu.Items.Add($stopOneItem) | Out-Null
        }
    }
    else {
        $statusItem = New-Object System.Windows.Forms.ToolStripMenuItem($script:res.menu.statusIdle)
        $statusItem.Enabled = $false
        $menu.Items.Add($statusItem) | Out-Null
    }

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $exitItem = New-Object System.Windows.Forms.ToolStripMenuItem($script:res.menu.exit)
    $exitItem.Add_Click({
            Stop-AllDashboards
            $script:notifyIcon.Visible = $false
            $script:notifyIcon.Dispose()
            [System.Windows.Forms.Application]::Exit()
        })
    $menu.Items.Add($exitItem) | Out-Null

    $script:notifyIcon.ContextMenuStrip = $menu
}

function Bring-BrowserToFront {
    $script:topMostHandles = @()

    $setuna = Get-Process -Name "SETUNA2" -ErrorAction SilentlyContinue
    if ($null -ne $setuna) {
        $topMost = [WinForeGround]::FindTopMostWindowsByPid([uint32]$setuna.Id)
        foreach ($hWnd in $topMost) {
            [WinForeGround]::RemoveTopMost($hWnd)
            $script:topMostHandles += $hWnd
        }
    }

    Start-Sleep -Milliseconds 200

    $browsers = @("msedge", "chrome", "firefox", "opera")
    foreach ($browser in $browsers) {
        $proc = Get-Process -Name $browser -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -ne $proc -and $proc.MainWindowHandle -ne [IntPtr]::Zero) {
            [WinForeGround]::ShowWindow($proc.MainWindowHandle, [WinForeGround]::SW_RESTORE)
            [WinForeGround]::SetForegroundWindow($proc.MainWindowHandle)
            break
        }
    }

    Start-Sleep -Milliseconds 300

    foreach ($hWnd in $script:topMostHandles) {
        [WinForeGround]::RestoreTopMost($hWnd)
    }
    $script:topMostHandles = @()
}

function Show-BalloonTip {
    param([string]$Text, [string]$Title = "Dashboard", [int]$Duration = 2000)
    $script:notifyIcon.BalloonTipText = $Text
    $script:notifyIcon.BalloonTipTitle = $Title
    $script:notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
    $script:notifyIcon.ShowBalloonTip($Duration)
}

function Main {
    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

    $existing = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object {
        $_.Id -ne $PID -and $_.MainWindowHandle -eq [IntPtr]::Zero
    }
    if ($existing.Count -gt 0) {
        foreach ($proc in $existing) {
            try {
                $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
                if ($cmdLine -and $cmdLine -match "Dashboard-TuoPan") {
                    Write-Host "[WARN] Dashboard-TuoPan is already running (PID: $($proc.Id))" -ForegroundColor Yellow
                    return
                }
            }
            catch { }
        }
    }

    $script:res = Load-Resources -ScriptDir $scriptDir
    if ($null -eq $script:res) {
        Write-Host "[ERROR] Failed to load resources. Exiting." -ForegroundColor Red
        pause
        return
    }

    $script:projectRoot = Find-ProjectRoot
    if (-not $script:projectRoot) {
        [System.Windows.Forms.MessageBox]::Show(
            $script:res.dialog.driveNotFound,
            "Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $icon = $null
    try {
        $pcDir = Join-Path ([System.IO.Path]::GetPathRoot($script:projectRoot)) "PC"
        $iconPath = Join-Path $pcDir "Understand-Anything-main\understand-anything-plugin\packages\dashboard\public\favicon.ico"
        if ((Test-Path $iconPath) -and (Get-Item $iconPath).Length -gt 0) {
            $icon = New-Object System.Drawing.Icon($iconPath)
        }
    }
    catch { }

    if ($null -eq $icon) {
        $icon = [System.Drawing.SystemIcons]::Information
    }

    $script:notifyIcon = New-Object System.Windows.Forms.NotifyIcon
    $script:notifyIcon.Icon = $icon
    $script:notifyIcon.Text = $script:res.tray.iconText
    $script:notifyIcon.Visible = $true

    $script:notifyIcon.Add_DoubleClick({
            Update-TrayMenu
        })

    Update-TrayMenu

    Show-BalloonTip -Text $script:res.tray.balloonText -Title $script:res.tray.balloonTitle

    [System.Windows.Forms.Application]::Run()
}

Main
