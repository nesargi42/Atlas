@echo off
echo 🚀 Starting Atlas Frontend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed
    echo Installing pnpm...
    npm install -g pnpm
)

echo 📦 Installing dependencies...
pnpm install

echo.
echo 🌐 Starting development server...
echo Frontend will be available at: http://localhost:3000
echo Backend should be running at: http://localhost:5000
echo.

pnpm dev



