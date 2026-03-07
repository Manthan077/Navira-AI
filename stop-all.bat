@echo off
echo ========================================
echo    Stopping All Services
echo ========================================
echo.

echo Stopping Navira Frontend...
taskkill /FI "WINDOWTITLE eq Navira Frontend*" /T /F >nul 2>&1

echo Stopping Simulation Frontend...
taskkill /FI "WINDOWTITLE eq Simulation Frontend*" /T /F >nul 2>&1

echo Stopping Simulation Server...
taskkill /FI "WINDOWTITLE eq Simulation Server*" /T /F >nul 2>&1

echo.
echo All services stopped!
echo.
pause
