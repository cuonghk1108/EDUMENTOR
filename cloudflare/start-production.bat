@echo off
title Edumentor - Production Mode with Cloudflare Tunnel
chcp 65001 >nul
echo ========================================
echo   EDUMENTOR - PRODUCTION MODE
echo   Domain: edumentor.io.vn
echo ========================================
echo.

cd /d D:\AII

echo [1/4] Building Frontend for Production...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
echo [OK] Frontend build completed!
echo.

echo [2/4] Starting Backend Server (Port 5000)...
cd /d D:\AII\backend
start "Edumentor - Backend" cmd /k "title Edumentor Backend && color 0A && node server.js"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Server (Port 3000)...
cd /d D:\AII\frontend
start "Edumentor - Frontend" cmd /k "title Edumentor Frontend && color 0B && npx serve -s build -l 3000"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Cloudflare Tunnel...
start "Edumentor - Tunnel" cmd /k "title Cloudflare Tunnel && color 0D && cloudflared tunnel --config D:\AII\cloudflare\config-production.yml run edumentor"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   PRODUCTION MODE ACTIVE
echo ========================================
echo.
echo   Local Access:
echo     Backend:  http://localhost:5000
echo     Frontend: http://localhost:3000
echo.
echo   Public Access (via Cloudflare):
echo     Website:  https://edumentor.io.vn
echo     API:      https://edumentor.io.vn/api
echo.
echo   Tunnel ID: 4f14b42d-2572-4678-91e9-f370e686f49e
echo.
echo   Press any key to close this window...
pause >nul
