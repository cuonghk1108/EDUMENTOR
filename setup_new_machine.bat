@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Edumentor - Setup v1.0

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo   EDUMENTOR - AUTO SETUP CHO MAY MOI
echo   Tien trinh se tai va cai thu vien can thiet
echo ===================================================
echo.

:: 1. Kiem tra va cai dat Node.js
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Khong tim thay Node.js. Dang tien hanh cai dat thong qua winget...
    winget install -e --id OpenJS.NodeJS
    if !ERRORLEVEL! neq 0 (
        echo [X] Cai dat Node.js that bai. Vui long cai dat thu cong tai https://nodejs.org/
        pause
        exit /b 1
    )
    echo [*] Cai dat Node.js thanh cong. MAY CAN KHOI DONG LAI FILE NAY SE TIEP TUC SAU DO!
    pause
    exit /b 0
) else (
    echo [OK] Node.js da duoc cai dat.
)

:: 2. Kiem tra va cai dat Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Khong tim thay Python. Dang tien hanh cai dat thong qua winget...
    winget install -e --id Python.Python.3.11
    if !ERRORLEVEL! neq 0 (
         echo [X] Cai dat Python that bai. Vui long cai dat thu cong tai https://www.python.org/
         pause
         exit /b 1
    )
    echo [*] Cai dat Python thanh cong. MAY CAN KHOI DONG LAI FILE NAY SE TIEP TUC SAU DO!
    pause
    exit /b 0
) else (
    echo [OK] Python da duoc cai dat.
)

:: 3. Kiem tra va tai Cloudflared vao muc cloudflare neu chua co global hoac chua co ban local.
cloudflared --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if not exist "%ROOT%\cloudflare\cloudflared.exe" (
        echo [!] Khong tim thay Cloudflared tren he thong. Dang tien hanh tai ve...
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

:: 4. Cai thu vien Frontend
echo.
echo [*] Dang cai dat thu vien Frontend...
cd /d "%ROOT%\frontend"
call npm install --no-fund --no-audit

:: 5. Cai thu vien Backend
echo.
echo [*] Dang cai dat thu vien Backend...
cd /d "%ROOT%\backend"
call npm install --no-fund --no-audit
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Da tao duoc .env cho backend
    )
)

:: 6. Tao Virtual Environment cho Celery 
echo.
echo [*] Thiet lap moi truong Python (Celery)...
cd /d "%ROOT%"
if not exist ".venv" (
    echo [*] Dang tao Virtual Environment...
    python -m venv .venv
)

cd /d "%ROOT%\celery"
call "%ROOT%\.venv\Scripts\activate.bat"
echo [*] Dang cai thu vien cho Celery...
pip install -r requirements.txt
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Da tao duoc .env cho celery
    )
)

echo.
echo ===================================================
echo   SETUP HOAN TAT! DANG TIEN HANH KHOI DONG SERVER
echo ===================================================
timeout /t 3 /nobreak >nul

cd /d "%ROOT%"
call start.bat
