@echo off
title Edumentor - Production Mode
chcp 65001 >nul
color 0A

echo.
echo   ███████╗██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗ ██████╗ ██████╗ 
echo   ██╔════╝██╔══██╗██║   ██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔══██╗
echo   █████╗  ██║  ██║██║   ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝
echo   ██╔══╝  ██║  ██║██║   ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔══██╗
echo   ███████╗██████╔╝╚██████╔╝██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ╚██████╔╝██║  ██║
echo   ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo   Mode: PRODUCTION - Backend phuc vu Frontend
echo   URL: http://localhost:5000 / https://edumentor.io.vn
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Kill existing processes
echo [0/2] Dang tat cac process cu (neu co)...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

cd /d D:\AII

REM Check if frontend build exists
if not exist "D:\AII\frontend\build\index.html" (
    echo.
    echo [!] Frontend build chua ton tai. Dang build...
    cd /d D:\AII\frontend
    call npm run build
    cd /d D:\AII
    echo [+] Build hoan tat!
    echo.
)

echo.
echo [1/2] Khoi dong Unified Server (Port 5000)...
echo      └─ Backend + Frontend trong 1 server
start "Edumentor - Server" cmd /k "cd /d D:\AII\backend && title [SERVER] Edumentor - Port 5000 && color 0A && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Khoi dong Cloudflare Tunnel...
echo      └─ Tunnel: edumentor.io.vn
start "Edumentor - Tunnel" cmd /k "title [TUNNEL] Cloudflare - edumentor.io.vn && color 0D && cloudflared tunnel --config D:\AII\cloudflare\config.yml run edumentor"
timeout /t 3 /nobreak >nul

echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.
color 0A
echo   ╔═══════════════════════════════════════════════════════════════════════════╗
echo   ║                          PRODUCTION MODE                                  ║
echo   ╠═══════════════════════════════════════════════════════════════════════════╣
echo   ║                                                                           ║
echo   ║   [✓] Server       : http://localhost:5000                               ║
echo   ║   [✓] Public URL   : https://edumentor.io.vn                             ║
echo   ║                                                                           ║
echo   ║   Backend + Frontend hop nhat trong 1 server                             ║
echo   ║   -> Trai nghiem nguoi dung muot ma, load nhanh hon                      ║
echo   ║                                                                           ║
echo   ╚═══════════════════════════════════════════════════════════════════════════╝
echo.
echo   Nhan phim bat ky de dong cua so nay...
pause >nul
