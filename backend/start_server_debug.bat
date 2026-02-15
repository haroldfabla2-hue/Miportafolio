@echo off
cd /d "d:\Proyectos personales\MiWeb\backend"
echo ==========================================
echo      SILHOUETTE BACKEND - DEBUG START
echo ==========================================
echo.
echo [1/2] Checking env...
if not exist .env (
    echo ❌ .env file missing!
    pause
    exit /b 1
)

echo [2/2] Starting NestJS Application...
echo.
node dist/main.js
echo.
echo ==========================================
echo ❌ CRASH DETECTED
echo Server stopped with exit code %ERRORLEVEL%.
echo Please copy the error message above and share it with the agent.
echo ==========================================
pause
