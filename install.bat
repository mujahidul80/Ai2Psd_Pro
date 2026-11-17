@echo off
setlocal
title Ai2Psd_Pro - 1-Click Installer
color 0b

echo ==========================================================
echo        Ai2Psd_Pro - Adobe Illustrator Script Installer
echo ==========================================================
echo.
echo [*] Launching 1-Click installer...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Notice: If prompted, please allow Administrator access.
)

echo.
pause
