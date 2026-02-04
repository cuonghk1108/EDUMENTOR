@echo off
echo ========================================
echo   EDUMENTOR - Cloudflare Tunnel Setup
echo ========================================
echo.

REM Kiem tra cloudflared da cai chua
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Cloudflared chua duoc cai dat!
    echo [*] Dang cai dat cloudflared...
    winget install --id Cloudflare.cloudflared
)

echo.
echo === BUOC 1: DANG NHAP CLOUDFLARE ===
echo Trinh duyet se mo, hay chon ten mien cua ban
echo.
cloudflared tunnel login

echo.
echo === BUOC 2: TAO TUNNEL ===
echo.
set /p TUNNEL_NAME="Nhap ten tunnel (vd: edumentor): "
cloudflared tunnel create %TUNNEL_NAME%

echo.
echo === BUOC 3: GHI LAI TUNNEL ID ===
echo Tunnel ID se hien thi o tren, copy lai de cau hinh
echo.

echo === BUOC 4: CAU HINH DNS ===
set /p DOMAIN="Nhap domain cua ban (vd: example.com): "

echo.
echo Dang tao DNS record...
cloudflared tunnel route dns %TUNNEL_NAME% %DOMAIN%
cloudflared tunnel route dns %TUNNEL_NAME% www.%DOMAIN%
cloudflared tunnel route dns %TUNNEL_NAME% api.%DOMAIN%

echo.
echo ========================================
echo   HOAN TAT CAU HINH!
echo ========================================
echo.
echo Bay gio hay:
echo 1. Mo file: D:\AII\cloudflare\config.yml
echo 2. Thay TUNNEL_ID bang ID vua tao
echo 3. Thay YOUR_USERNAME bang ten user Windows
echo 4. Thay yourdomain.com bang domain cua ban
echo 5. Chay: start-tunnel.bat
echo.
pause
