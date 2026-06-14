@echo off

for %%d in (Z Y X W V U T S R Q P O N M L K J I H G F E D) do (
    if exist "%%d:\XiangMu-KongJian" (
        set "PROJECT_ROOT=%%d:\XiangMu-KongJian"
        goto :found
    )
)
echo.
echo   ERROR: Cannot find XiangMu-KongJian on any drive!
pause >nul
exit /b 1

:found
for /f "delims=" %%i in ('dir /b /ad "%PROJECT_ROOT%\..\PC\tools\node\node-v*" 2^>nul') do (
    set "NODE_DIR=%PROJECT_ROOT%\..\PC\tools\node\%%i"
    goto :nodefound
)
set "NODE_DIR="

:nodefound
if defined NODE_DIR (
    set "PATH=%NODE_DIR%;%PATH%"
) else (
    echo   WARNING: Node.js not found in PC\tools\node\
)

set "DASHBOARD_DIR=%PROJECT_ROOT%\..\PC\Understand-Anything-main\understand-anything-plugin\packages\dashboard"
set "PC_DIR=%PROJECT_ROOT%\..\PC"
set "TUPU_DIR=%PC_DIR%\ZhiShi-TuPu"

echo.
echo   ============================================
echo       ZhiShi-TuPu Dashboard Launcher
echo   ============================================
echo   ProjectRoot: %PROJECT_ROOT%
echo   NodeDir: %NODE_DIR%
echo   ============================================
echo.

:menu
echo   [1] CaiPin-FenJing       (port 5173)
echo   [2] Zhaimomo-XiangQing   (port 5174)
echo   [3] PromptXtar            (port 5175)
echo   [4] Understand-Anything   (port 5176)
echo   [5] MrBeast-FangFaLun     (port 5177)
echo   [6] NvWa-Skill            (port 5178)
echo   [7] SETUNA2               (port 5179)
echo   [8] CangQiong             (port 5180)
echo   [0] Exit
echo.

set "choice="
set /p "choice=Select: "

if not defined choice goto menu
if "%choice%"=="1" goto project1
if "%choice%"=="2" goto project2
if "%choice%"=="3" goto project3
if "%choice%"=="4" goto project4
if "%choice%"=="5" goto project5
if "%choice%"=="6" goto project6
if "%choice%"=="7" goto project7
if "%choice%"=="8" goto project8
if "%choice%"=="0" goto end

echo.
echo   Invalid choice
echo.
goto menu

:project1
set "GRAPH_DIR=%TUPU_DIR%\CaiPin-FenJing"
set "PORT=5173"
set "PROJ_NAME=CaiPin-FenJing"
goto launch

:project2
set "GRAPH_DIR=%TUPU_DIR%\Zhaimomo-XiangQing"
set "PORT=5174"
set "PROJ_NAME=Zhaimomo-XiangQing"
goto launch

:project3
set "GRAPH_DIR=%TUPU_DIR%\PromptXtar"
set "PORT=5175"
set "PROJ_NAME=PromptXtar"
goto launch

:project4
set "GRAPH_DIR=%TUPU_DIR%\Understand-Anything"
set "PORT=5176"
set "PROJ_NAME=Understand-Anything"
goto launch

:project5
set "GRAPH_DIR=%TUPU_DIR%\MrBeast-FangFaLun"
set "PORT=5177"
set "PROJ_NAME=MrBeast-FangFaLun"
goto launch

:project6
set "GRAPH_DIR=%TUPU_DIR%\NvWa-Skill"
set "PORT=5178"
set "PROJ_NAME=NvWa-Skill"
goto launch

:project7
set "GRAPH_DIR=%TUPU_DIR%\SETUNA2"
set "PORT=5179"
set "PROJ_NAME=SETUNA2"
goto launch

:project8
set "GRAPH_DIR=%TUPU_DIR%\CangQiong"
set "PORT=5180"
set "PROJ_NAME=CangQiong"
goto launch

:launch
echo.
echo   Starting %PROJ_NAME% Dashboard on port %PORT%...
echo   GRAPH_DIR: %GRAPH_DIR%
echo.

cd /d "%DASHBOARD_DIR%"
if errorlevel 1 (
    echo.
    echo   ERROR: Cannot find Dashboard directory!
    echo   Expected: %DASHBOARD_DIR%
    pause >nul
    goto end
)

set "VBS_FILE=%TEMP%\ua-dashboard-%PROJ_NAME%.vbs"
echo Set objShell = CreateObject("WScript.Shell")> "%VBS_FILE%"
echo objShell.Environment("Process").Item("GRAPH_DIR") = "%GRAPH_DIR%">> "%VBS_FILE%"
echo objShell.Environment("Process").Item("PATH") = "%PATH%">> "%VBS_FILE%"
echo objShell.CurrentDirectory = "%DASHBOARD_DIR%">> "%VBS_FILE%"
echo objShell.Run "cmd /c call node_modules\.bin\vite.CMD --host 127.0.0.1 --port %PORT% --no-open", 0, False>> "%VBS_FILE%"

wscript //nologo "%VBS_FILE%"

echo   Waiting for server to start...
timeout /t 4 /nobreak >nul

echo   Opening browser: http://127.0.0.1:%PORT%/
start "" "http://127.0.0.1:%PORT%/"

echo.
echo   %PROJ_NAME% Dashboard is running on port %PORT%.
echo   URL: http://127.0.0.1:%PORT%/
echo   You can safely close this launcher window.
echo.

goto menu

:end
echo.
echo   Dashboard servers are still running in background.
echo   Use Task Manager to stop node.exe if needed.
echo.
echo   Bye!
timeout /t 2 /nobreak >nul
