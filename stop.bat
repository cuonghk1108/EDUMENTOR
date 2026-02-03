@echo off
title GIA SU AI - Stop Script
color 0C

echo ========================================
echo    GIA SU AI - Tat he thong
echo ========================================
echo.

echo [INFO] Dang tat tat ca Node.js processes...
taskkill /F /IM node.exe >nul 2>nul

echo.
echo [OK] Da tat tat ca servers!
echo.
timeout /t 2 /nobreak >nul
