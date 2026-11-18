@echo off
setlocal
title Ai2Psd_Pro - 1-Click Installer
color 0b

echo ==========================================================
echo        Ai2Psd_Pro - Adobe Illustrator Script Installer
echo ==========================================================
echo.
echo [*] Downloading installer securely...
set "TEMP_PS=%TEMP%\Ai2Psd_Pro_installer.ps1"

powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1', '%TEMP_PS%')"

if exist "%TEMP_PS%" (
    echo [*] Launching installer...
    powershell -NoProfile -ExecutionPolicy RemoteSigned -File "%TEMP_PS%"
    if exist "%TEMP_PS%" del /f /q "%TEMP_PS%" >nul 2>&1
) else (
    echo.
    echo [X] Error: Could not download installer. Please check your internet connection.
    pause
)
