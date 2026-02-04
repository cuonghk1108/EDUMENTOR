@echo off
echo ========================================
echo   STOPPING ALL SERVICES
echo ========================================
echo.

echo Stopping Backend...
taskkill /FI "WINDOWTITLE eq Backend*" /F >nul 2>&1

echo Stopping Frontend...
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>&1

echo Stopping Cloudflare Tunnel...
taskkill /FI "WINDOWTITLE eq Cloudflare*" /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1

echo.
echo All services stopped!
pause
