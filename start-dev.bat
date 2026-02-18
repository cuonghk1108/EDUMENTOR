@echo off
title Edumentor - Development Mode
chcp 65001 >nul
color 0B

echo.
echo   ███████╗██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗ ██████╗ ██████╗ 
echo   ██╔════╝██╔══██╗██║   ██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔══██╗
echo   █████╗  ██║  ██║██║   ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝
echo   ██╔══╝  ██║  ██║██║   ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔══██╗
echo   ███████╗██████╔╝╚██████╔╝██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ╚██████╔╝██║  ██║
echo   ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo   Mode: DEVELOPMENT - Hot Reload
echo   Backend: http://localhost:5000  |  Frontend: http://localhost:3000
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Kill existing processes
echo [0/2] Dang tat cac process cu (neu co)...
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

cd /d D:\AII

echo.
echo [1/2] Khoi dong Backend Server (Port 5000) - Hot Reload...
echo      └─ nodemon server.js
start "Edumentor - Backend" cmd /k "cd /d D:\AII\backend && title [BACKEND] Edumentor API - Port 5000 && color 0A && npx nodemon server.js"
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Khoi dong Frontend Server (Port 3000) - Hot Reload...
echo      └─ npm start
start "Edumentor - Frontend" cmd /k "cd /d D:\AII\frontend && title [FRONTEND] Edumentor UI - Port 3000 && color 0B && npm start"
timeout /t 3 /nobreak >nul

echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.
color 0B
echo   ╔═══════════════════════════════════════════════════════════════════════════╗
echo   ║                         DEVELOPMENT MODE                                  ║
echo   ╠═══════════════════════════════════════════════════════════════════════════╣
echo   ║                                                                           ║
echo   ║   [✓] Backend      : http://localhost:5000/api                           ║
echo   ║   [✓] Frontend     : http://localhost:3000                               ║
echo   ║                                                                           ║
echo   ║   Hot Reload enabled - Code thay doi se tu dong cap nhat                 ║
echo   ║                                                                           ║
echo   ╚═══════════════════════════════════════════════════════════════════════════╝
echo.
echo   Nhan phim bat ky de dong cua so nay...
pause >nul
