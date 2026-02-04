@echo off
title Edumentor - Quick Start
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
echo   Domain: https://edumentor.io.vn
echo.
echo ═══════════════════════════════════════════════════════════════════════════════════
echo.
echo   [1] Chay Production (Build + Cloudflare Tunnel)
echo   [2] Chay Development (Local only)
echo   [3] Dung tat ca services
echo   [4] Kiem tra trang thai Tunnel
echo   [5] Thoat
echo.
echo ═══════════════════════════════════════════════════════════════════════════════════
echo.

set /p choice="Chon [1-5]: "

if "%choice%"=="1" goto production
if "%choice%"=="2" goto development
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto status
if "%choice%"=="5" goto end

echo Lua chon khong hop le!
pause
goto end

:production
echo.
echo [*] Dang khoi dong Production mode...
call D:\AII\cloudflare\start-production.bat
goto end

:development
echo.
echo [*] Dang khoi dong Development mode...
cd /d D:\AII

echo [1/2] Starting Backend...
start "Edumentor - Backend DEV" cmd /k "cd /d D:\AII\backend && title Backend DEV && color 0A && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend...
start "Edumentor - Frontend DEV" cmd /k "cd /d D:\AII\frontend && title Frontend DEV && color 0B && npm start"

echo.
echo ========================================
echo   DEVELOPMENT MODE ACTIVE
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
pause
goto end

:stop
echo.
echo [*] Dang dung tat ca services...
taskkill /FI "WINDOWTITLE eq Edumentor*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Cloudflare*" /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
echo [OK] Da dung tat ca services!
pause
goto end

:status
echo.
echo [*] Kiem tra trang thai Tunnel...
cloudflared tunnel info edumentor
echo.
pause
goto end

:end
