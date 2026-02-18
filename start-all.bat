@echo off
title Edumentor - Launcher
chcp 65001 >nul

:menu
cls
color 0F

echo.
echo   ███████╗██████╗ ██╗   ██╗███╗   ███╗███████╗███╗   ██╗████████╗ ██████╗ ██████╗ 
echo   ██╔════╝██╔══██╗██║   ██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔══██╗
echo   █████╗  ██║  ██║██║   ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝
echo   ██╔══╝  ██║  ██║██║   ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔══██╗
echo   ███████╗██████╔╝╚██████╔╝██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ╚██████╔╝██║  ██║
echo   ╚══════╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo                         EDUMENTOR - LAUNCHER
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.
echo.
echo   ╔═══════════════════════════════════════════════════════════════════════════╗
echo   ║                                                                           ║
echo   ║   [1] PRODUCTION MODE                                                     ║
echo   ║       └─ Backend + Frontend hop nhat, Cloudflare Tunnel                   ║
echo   ║       └─ URL: https://edumentor.io.vn                                     ║
echo   ║                                                                           ║
echo   ║   [2] DEVELOPMENT MODE                                                    ║
echo   ║       └─ Backend (5000) + Frontend (3000) rieng biet                      ║
echo   ║       └─ Hot Reload enabled                                               ║
echo   ║                                                                           ║
echo   ║   [3] BUILD FRONTEND                                                      ║
echo   ║       └─ Tao ban build production cho frontend                            ║
echo   ║                                                                           ║
echo   ║   [4] STOP ALL SERVERS                                                    ║
echo   ║       └─ Dung tat ca server dang chay                                     ║
echo   ║                                                                           ║
echo   ║   [0] EXIT                                                                ║
echo   ║                                                                           ║
echo   ╚═══════════════════════════════════════════════════════════════════════════╝
echo.
set /p choice="   Chon che do [0-4]: "

if "%choice%"=="1" goto production
if "%choice%"=="2" goto development
if "%choice%"=="3" goto build
if "%choice%"=="4" goto stop
if "%choice%"=="0" goto exit
goto menu

:production
call D:\AII\start-prod.bat
goto menu

:development
call D:\AII\start-dev.bat
goto menu

:build
cls
color 0E
echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo                           BUILDING FRONTEND...
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.
cd /d D:\AII\frontend
call npm run build
echo.
echo   ═══════════════════════════════════════════════════════════════════════════════
echo                           BUILD HOAN TAT!
echo   ═══════════════════════════════════════════════════════════════════════════════
echo.
pause
goto menu

:stop
cls
color 0C
echo.
echo   Dang dung tat ca servers...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
echo   [OK] Da dung tat ca servers!
echo.
timeout /t 2 /nobreak >nul
goto menu

:exit
exit
