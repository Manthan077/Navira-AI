@echo off
echo ========================================
echo    Navira AI - Complete System Startup
echo ========================================
echo.

REM Create logs directory
if not exist logs mkdir logs

echo [Step 1/5] Checking dependencies...
echo.

REM Check frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Check simulation dependencies
if exist "simulation-main" (
    if not exist "simulation-main\node_modules" (
        echo Installing simulation frontend dependencies...
        cd simulation-main
        call npm install
        cd ..
        echo.
    )
    
    if not exist "simulation-main\server\node_modules" (
        echo Installing simulation server dependencies...
        cd simulation-main\server
        call npm install
        cd ..\..
        echo.
    )
)

echo [Step 2/5] Starting Simulation Server (port 4000)...
if exist "simulation-main\server" (
    cd simulation-main\server
    start "Simulation Server" cmd /k "npm start"
    cd ..\..
    timeout /t 3 /nobreak >nul
    echo   Server started at http://localhost:4000
) else (
    echo   [SKIP] Simulation server not found
)
echo.

echo [Step 3/5] Starting Simulation Frontend (port 5173)...
if exist "simulation-main" (
    cd simulation-main
    start "Simulation Frontend" cmd /k "npm run dev"
    cd ..
    timeout /t 3 /nobreak >nul
    echo   Frontend started at http://localhost:5173
) else (
    echo   [SKIP] Simulation frontend not found
)
echo.

echo [Step 4/5] Starting Main Frontend (port 8080)...
cd frontend
start "Navira Frontend" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul
echo   Frontend started at http://localhost:8080
echo.

echo [Step 5/5] Verifying services...
timeout /t 2 /nobreak >nul

curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Main Frontend is running
) else (
    echo   [WAIT] Main Frontend is starting...
)

if exist "simulation-main\server" (
    curl -s http://localhost:4000/api/status >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] Simulation Server is running
    ) else (
        echo   [WAIT] Simulation Server is starting...
    )
)

echo.
echo ========================================
echo    All Services Started!
echo ========================================
echo.
echo   Main Application:      http://localhost:8080
if exist "simulation-main" (
    echo   Simulation Frontend:   http://localhost:5173
    echo   Simulation Server:     http://localhost:4000
)
echo.
echo ========================================
echo    Quick Start Guide
echo ========================================
echo.
echo 1. Open http://localhost:8080
echo 2. Login with demo credentials:
echo    - Driver: manthan@gmail.com / Manthan123
echo 3. Click "Traffic Simulation" button
echo 4. Enjoy the simulation!
echo.
echo ========================================
echo    To Stop All Services
echo ========================================
echo.
echo Press Ctrl+C in each terminal window
echo Or run: stop-all.bat
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:8080

echo.
echo Browser opened. Services are running in separate windows.
echo.
pause
