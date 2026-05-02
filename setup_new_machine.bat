@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Edumentor - Full Setup

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo   EDUMENTOR - AUTO SETUP (FULL DEPENDENCIES)
echo   Script se tu dong tai va cai dat tat ca moi thu
echo ===================================================
echo.

:: 1. Kiem tra va cai dat Node.js
echo.
echo === 1. KIEM TRA NODE.JS ===
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Khong tim thay Node.js. Dang tien hanh cai dat...
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    if !ERRORLEVEL! neq 0 (
        echo [X] Cai dat Node.js that bai. Vui long cai chu dong tai https://nodejs.org/
        pause
        exit /b 1
    )
    echo [*] Cai dat Node.js xong. BANG CMD CO THE CHUA NHAN VARIABLE PATH.
    echo [*] VUI LONG TAT VA MO LAI SCRIPT NAY SAU KHI NODEJS CAI DAT XONG!
    pause
    exit /b 0
) else (
    echo [OK] Node.js da ton tai tren may.
)

:: 2. Kiem tra va cai dat Python
echo.
echo === 2. KIEM TRA PYTHON ===
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Khong tim thay Python. Dang tien hanh cai dat...
    winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements
    if !ERRORLEVEL! neq 0 (
         echo [X] Cai dat Python that bai. Vui long cai chu dong tai https://www.python.org/
         pause
         exit /b 1
    )
    echo [*] Cai dat Python xong. BANG CMD CO THE CHUA NHAN VARIABLE PATH.
    echo [*] VUI LONG TAT VA MO LAI SCRIPT NAY SAU KHI PYTHON CAI DAT XONG!
    pause
    exit /b 0
) else (
    echo [OK] Python da ton tai tren may.
)

:: 3. Tai & Cai dat Redis (Windows Port)
echo.
echo === 3. KIEM TRA REDIS SERVER ===
if not exist "%ROOT%\redis\redis-server.exe" (
    echo [!] Dang tai Redis cho Windows vao thu muc \redis ...
    if not exist "%ROOT%\redis" mkdir "%ROOT%\redis"
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip' -OutFile '%ROOT%\redis\redis.zip'"
    if exist "%ROOT%\redis\redis.zip" (
        echo [*] Dang giai nen Redis...
        powershell -Command "Expand-Archive -Path '%ROOT%\redis\redis.zip' -DestinationPath '%ROOT%\redis' -Force"
        del "%ROOT%\redis\redis.zip"
        echo [OK] Da tai va giai nen Redis thah cong.
    ) else (
        echo [X] Tai Redis cap nhat that bai.
    )
) else (
    echo [OK] Redis Server (Local) da co san.
)

:: 4. Tai Cloudflared
echo.
echo === 4. KIEM TRA CLOUDFLARED TUNNEL ===
cloudflared --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if not exist "%ROOT%\cloudflare\cloudflared.exe" (
        echo [!] Khong tim thay Cloudflared. Dang tien hanh tai ve...
        if not exist "%ROOT%\cloudflare" mkdir "%ROOT%\cloudflare"
        powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%ROOT%\cloudflare\cloudflared.exe'"
        if exist "%ROOT%\cloudflare\cloudflared.exe" (
            echo [OK] Da tai Cloudflared vao thu muc cloudflare.
        ) else (
            echo [X] Tai Cloudflared that bai.
        )
    ) else (
        echo [OK] Cloudflared (Local) da co san.
    )
) else (
    echo [OK] Cloudflared (Global) da duoc cai dat.
)

:: 5. Cai thu vien Frontend va Build luon
echo.
echo === 5. CAI DAT FRONTEND ===
cd /d "%ROOT%\frontend"
echo [*] Dang cai dat module npm cho Frontend...
call npm install --no-fund --no-audit
if not exist "build\index.html" (
    echo [*] Dang Build Frontend (ReactJS) lan dau...
    call npm run build
) else (
    echo [OK] Frontend da duoc build tu truoc.
)

:: 6. Cai thu vien Backend
echo.
echo === 6. CAI DAT BACKEND ===
cd /d "%ROOT%\backend"
echo [*] Dang cai dat module npm cho Backend...
call npm install --no-fund --no-audit

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Da tao duoc file .env cho Backend tu .env.example
    ) else (
        echo [!] Thieu file .env.example o Backend.
    )
) else (
    echo [OK] Backend da co file .env.
)

:: 7. Tao Virtual Environment va cai thu vien Celery 
echo.
echo === 7. CAI DAT CELERY (PYTHON) ===
cd /d "%ROOT%"
if not exist ".venv" (
    echo [*] Dang tao quan ly moi truong ao Python (venv)...
    python -m venv .venv
)

cd /d "%ROOT%\celery"
call "%ROOT%\.venv\Scripts\activate.bat"
echo [*] Dang cai thu vien cho Celery qua pip...
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Da tao duoc file .env cho Celery tu .env.example
    ) else (
         echo [!] Thieu file .env.example o Celery.
    )
) else (
    echo [OK] Celery da co file .env.
)
call deactivate

echo.
echo ===================================================
echo   SETUP DA HOAN TAT THANH CONG TOAN BO!
echo   VUI LONG CHECK LAI FILE .ENV TRONG BACKEND/CELERY 
echo   DE DIEN KHOA API CUA BAN (XAI_API, MURF, JWT...).
echo.
echo   HE THONG SE TU DONG KHOI DONG SERVER SAU 5 GIAY...
echo ===================================================
timeout /t 5 /nobreak >nul

cd /d "%ROOT%"
call start.bat
