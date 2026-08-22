@echo off
title atmosfera - GitHub Push and Backup
color 0A

echo.
echo   ========================================================
echo    atmosfera - GitHub Sync and Backup
echo   ========================================================
echo.

powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0push-github.ps1" %*

echo.
pause
