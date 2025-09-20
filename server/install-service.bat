@echo off
echo Installing Atlas FastAPI as Windows Service...
echo.
echo This script requires NSSM (Non-Sucking Service Manager)
echo Download from: https://nssm.cc/
echo.
echo Make sure NSSM is in your PATH or in the same directory
echo.

set SERVICE_NAME=AtlasAPI
set PYTHON_PATH=python.exe
set APP_PATH=%~dp0main.py
set APP_DIR=%~dp0

echo Service Name: %SERVICE_NAME%
echo Python Path: %PYTHON_PATH%
echo App Path: %APP_PATH%
echo App Directory: %APP_DIR%
echo.

echo Installing service...
nssm install %SERVICE_NAME% %PYTHON_PATH% %APP_PATH%

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install service. Make sure NSSM is available.
    pause
    exit /b 1
)

echo Setting service directory...
nssm set %SERVICE_NAME% AppDirectory %APP_DIR%

echo Setting service description...
nssm set %SERVICE_NAME% Description "Atlas Company Analyzer FastAPI Backend Server"

echo Setting startup type to automatic...
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START

echo Service installed successfully!
echo.
echo To start the service: net start %SERVICE_NAME%
echo To stop the service: net stop %SERVICE_NAME%
echo To remove the service: nssm remove %SERVICE_NAME% confirm
echo.
pause

