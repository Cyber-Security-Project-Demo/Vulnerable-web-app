@echo off
echo Starting InsecureBank - Vulnerable Banking Application...
echo.
echo WARNING: This application contains intentional security vulnerabilities!
echo Use only for educational purposes in a safe environment.
echo.

echo Checking prerequisites...
if not exist "backend\package.json" (
    echo ERROR: Backend package.json not found. Please run from project root directory.
    pause
    exit /b 1
)

if not exist "vul-bank-app\package.json" (
    echo ERROR: Frontend package.json not found. Please run from project root directory.
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0vul-bank-app" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo IMPORTANT: Make sure XAMPP MySQL is running!
echo.
echo To test vulnerabilities, see TESTING-GUIDE.md
echo.
pause