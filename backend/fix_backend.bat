@echo off
echo ========================================== > repair.log
echo      Silhouette Backend Repair Log      >> repair.log
echo ========================================== >> repair.log
echo Date: %DATE% %TIME% >> repair.log
echo. >> repair.log

cd /d "d:\Proyectos personales\MiWeb\backend"

echo [1/5] Checking Node Version... >> repair.log
node -v >> repair.log 2>&1
echo. >> repair.log

echo [2/5] Installing Dependencies... >> repair.log
call npm install >> repair.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed! >> repair.log
    exit /b %ERRORLEVEL%
)
echo ✅ Dependencies installed. >> repair.log
echo. >> repair.log

echo [3/5] Generating Prisma Client... >> repair.log
call npx prisma generate >> repair.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ prisma generate failed! >> repair.log
    exit /b %ERRORLEVEL%
)
echo ✅ Prisma Client generated. >> repair.log
echo. >> repair.log

echo [4/5] Building Project (TypeScript Check)... >> repair.log
call npm run build >> repair.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ BUILD FAILED! Fixing compiler errors is required. >> repair.log
    exit /b %ERRORLEVEL%
)
echo ✅ Build successful. >> repair.log
echo. >> repair.log

echo [5/5] specific startup check... >> repair.log
REM Try to start and kill immediately just to check for runtime errors
node dist/main.js --help >> repair.log 2>&1

echo ========================================== >> repair.log
echo           REPAIR COMPLETE                  >> repair.log
echo ========================================== >> repair.log
