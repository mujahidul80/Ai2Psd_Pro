@echo off
setlocal
title Ai2Psd_Pro - 1-Click Installer for Adobe Illustrator
color 0b

echo ==========================================================
echo        Ai2Psd_Pro - Adobe Illustrator Script Installer
echo ==========================================================
echo.
echo [*] Checking and launching PowerShell installer...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] An error occurred during installation.
    echo [!] Please try running this script as Administrator.
)

echo.
pause
