@echo off
title Edumentor - Full Stack with Cloudflare Tunnel
echo ========================================
echo   EDUMENTOR - STARTING ALL SERVICES
echo ========================================
echo.

REM Di chuyen vao thu muc du an
cd /d D:\AII

echo [1/3] Starting Backend Server...
start "Backend - Port 5000" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Server...
start "Frontend - Port 3000" cmd /k "cd frontend && npm start"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --config D:\AII\cloudflare\config.yml run"

echo.
echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo   Public:   https://edumentor.io.vn (via Cloudflare Tunnel)
echo.
echo   Nhan phim bat ky de dong cua so nay...
pause >nul
