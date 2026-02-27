@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Edumentor - Start (Localhost + Tunnel + Celery)

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

color 0A
echo.
echo [*] Khoi dong localhost + tunnel + celery...
call :stop_silent

if not exist "%ROOT%\frontend\build\index.html" (
  echo [i] Chua co build frontend, dang build...
  cd /d "%ROOT%\frontend"
  call npm run build
)

set "CLOUDFLARED_CMD=cloudflared"
if exist "%ROOT%\cloudflare\cloudflared.exe" (
  set "CLOUDFLARED_CMD=%ROOT%\cloudflare\cloudflared.exe"
)

start "Edumentor - Server" cmd /k "cd /d %ROOT%\backend && title [SERVER] Port 5000 && node server.js"
timeout /t 2 /nobreak >nul
start "Edumentor - Tunnel" cmd /k "title [TUNNEL] edumentor && !CLOUDFLARED_CMD! tunnel --config %ROOT%\cloudflare\config.yml run edumentor"
timeout /t 1 /nobreak >nul
start "Edumentor - Celery API" cmd /k "cd /d %ROOT%\celery && "%ROOT%\.venv\Scripts\python.exe" -m uvicorn worker_api:app --host 0.0.0.0 --port 8001"
timeout /t 1 /nobreak >nul
start "Edumentor - Celery Worker" cmd /k "cd /d %ROOT%\celery && "%ROOT%\.venv\Scripts\python.exe" -m celery -A celery_app.celery_app worker --loglevel=info --pool=solo"

echo [OK] Localhost: http://localhost:5000
echo [OK] Tunnel: https://edumentor.io.vn
echo [OK] Celery API: http://localhost:8001
pause
goto end

:stop_silent
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1
exit /b 0

:end
endlocal
exit /b 0
