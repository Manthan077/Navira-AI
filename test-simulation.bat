@echo off
echo ========================================
echo    Testing Simulation Button
echo ========================================
echo.

echo Checking if frontend is running...
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Frontend is not running!
    echo Please run start-all.bat first
    pause
    exit /b 1
)

echo [OK] Frontend is running
echo.

echo ========================================
echo    Test Checklist
echo ========================================
echo.
echo [ ] 1. Open http://localhost:8080
echo [ ] 2. Login with demo credentials:
echo        - Driver: manthan@gmail.com / Manthan123
echo [ ] 3. You should see Ambulance Dashboard
echo [ ] 4. Look for "Simulate Movement" button
echo [ ] 5. Click the button
echo [ ] 6. Check browser console (F12) for logs
echo [ ] 7. Verify location updates every 2 seconds
echo.
echo ========================================
echo    Expected Console Output
echo ========================================
echo.
echo   Simulation check: {isSimulating: true, hasAmbulance: true}
echo   Starting simulation interval
echo   Simulating movement: {newLat: ..., newLng: ...}
echo.
echo ========================================
echo    Troubleshooting
echo ========================================
echo.
echo If button doesn't work:
echo   1. Check browser console for errors
echo   2. Verify ambulance data is loaded
echo   3. Try refreshing the page
echo   4. Check network tab for API calls
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:8080

echo.
echo Browser opened. Follow the test checklist above.
echo.
pause
