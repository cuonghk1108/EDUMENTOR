@echo off
title EDUMENTOR - Startup Script
color 0A

echo ========================================
echo    EDUMENTOR - Khoi dong he thong
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node -v
echo.

:: Kill existing Node processes (optional)
echo [INFO] Dang tat cac process Node.js cu...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul

:: Start Backend
echo [INFO] Dang khoi dong Backend...
cd /d "%~dp0backend"
start "EDUMENTOR - Backend" cmd /k "color 0B && echo Backend Server && echo ================ && node server.js"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [INFO] Dang khoi dong Frontend...
cd /d "%~dp0frontend"
start "EDUMENTOR - Frontend" cmd /k "color 0E && echo Frontend Server && echo ================ && npm start"

echo.
echo ========================================
echo    Khoi dong thanh cong!
echo ========================================
echo.
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo  Admin:    http://localhost:3000/admin
echo.
echo  Nhan phim bat ky de dong cua so nay...
echo ========================================
pause >nul
