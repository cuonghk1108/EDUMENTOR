#!/usr/bin/env pwsh
# EDUMENTOR - Start All Services (PowerShell)
# Usage: .\start.ps1

param(
    [string]$Mode = "all"  # "all" | "backend" | "tunnel" | "celery"
)

$ROOT = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$BACKEND_PATH = Join-Path $ROOT "backend"
$FRONTEND_PATH = Join-Path $ROOT "frontend"
$CELERY_PATH = Join-Path $ROOT "celery"
$CLOUDFLARE_PATH = Join-Path $ROOT "cloudflare"
$CONFIG_FILE = Join-Path $CLOUDFLARE_PATH "config-production.yml"

Write-Host "
╔═══════════════════════════════════════════════════════════╗
║          🚀 EDUMENTOR - Start All Services               ║
║                                                           ║
║          Localhost: http://localhost:5000                ║
║          Production: https://edumentor.io.vn             ║
║          Celery API: http://localhost:8001               ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Kill existing processes
Write-Host "`n[*] Stopping existing processes..." -ForegroundColor Yellow
Get-Process node, python, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Build frontend if needed
if (-not (Test-Path "$FRONTEND_PATH/build/index.html")) {
    Write-Host "`n[*] Building frontend..." -ForegroundColor Yellow
    Push-Location $FRONTEND_PATH
    npm run build
    Pop-Location
}

# Start Redis (if exists)
if (Test-Path "$ROOT/redis/redis-server.exe") {
    Write-Host "`n[✓] Starting Redis..." -ForegroundColor Green
    & Start-Process cmd "/k cd $ROOT\redis && redis-server.exe" -WindowStyle Normal
    Start-Sleep -Seconds 1
}

# Start Backend
if ($Mode -eq "all" -or $Mode -eq "backend") {
    Write-Host "[✓] Starting Backend (Port 5000)..." -ForegroundColor Green
    & Start-Process cmd "/k cd $BACKEND_PATH && npm start" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start Cloudflare Tunnel
if ($Mode -eq "all" -or $Mode -eq "tunnel") {
    Write-Host "[✓] Starting Cloudflare Tunnel..." -ForegroundColor Green
    & Start-Process cmd "/k cloudflared tunnel --config $CONFIG_FILE run edumentor" -WindowStyle Normal
    Start-Sleep -Seconds 1
}

# Start Celery (if requested)
if ($Mode -eq "all" -or $Mode -eq "celery") {
    Write-Host "[✓] Starting Celery API & Worker..." -ForegroundColor Green
    
    # Celery API
    & Start-Process cmd "/k cd $CELERY_PATH && python -m uvicorn worker_api:app --host 0.0.0.0 --port 8001" -WindowStyle Normal
    Start-Sleep -Seconds 1
    
    # Celery Worker
    & Start-Process cmd "/k cd $CELERY_PATH && python -m celery -A celery_app.celery_app worker --loglevel=info --pool=solo" -WindowStyle Normal
}

Write-Host "`n
╔═══════════════════════════════════════════════════════════╗
║              ✅ All Services Started                      ║
╠═══════════════════════════════════════════════════════════╣
║  🖥️  Backend:        http://localhost:5000               ║
║  🌐 Production:       https://edumentor.io.vn            ║
║  🔄 Celery API:       http://localhost:8001              ║
║  💾 Redis:           Port 6379 (if running)              ║
╠═══════════════════════════════════════════════════════════╣
║  📌 Check terminal windows for logs                       ║
║  ⚠️  Close any window to stop that service               ║
╚═══════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Read-Host "Press Enter to continue..."
