<#
.SYNOPSIS
    1-Click Installer for Ai2Psd_Pro (Adobe Illustrator Script).
.DESCRIPTION
    Detects all installed versions of Adobe Illustrator on Windows,
    locates their Presets/<Locale>/Scripts folder, and downloads the latest
    Ai2Psd_Pro.jsx script directly from GitHub.
.AUTHOR
    Mujahidul Islam (mujahidul80)
    https://github.com/mujahidul80/Ai2Psd_Pro
#>

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 1. Administrator Rights Check & Self-Elevation
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "`n[*] Administrative privileges are required to install into Program Files." -ForegroundColor Yellow
    Write-Host "[*] Requesting administrator rights..." -ForegroundColor Cyan
    
    $rawUrl = "https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1"
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"irm $rawUrl | iex`""
    exit
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Ai2Psd_Pro - 1-Click Installer for Adobe Illustrator  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Configuration & URLs
$repoOwner   = "mujahidul80"
$repoName    = "Ai2Psd_Pro"
$branch      = "main"
$scriptName  = "Ai2Psd_Pro.jsx"
$downloadUrl = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/$scriptName"

# 3. Locate Adobe Illustrator Installations
$searchRoots = @(
    (Join-Path ${env:ProgramFiles} "Adobe"),
    (Join-Path ${env:SystemDrive} "Program Files\Adobe"),
    "D:\Program Files\Adobe"
) | Select-Object -Unique

$installedScriptsFolders = @()

foreach ($root in $searchRoots) {
    if (Test-Path $root) {
        $aiDirs = Get-ChildItem -Path $root -Directory -Filter "Adobe Illustrator*" -ErrorAction SilentlyContinue
        foreach ($ai in $aiDirs) {
            $presetsDir = Join-Path $ai.FullName "Presets"
            if (Test-Path $presetsDir) {
                # Look for Presets\<Locale>\Scripts
                $scriptsDirs = Get-ChildItem -Path $presetsDir -Directory -Recurse -Filter "Scripts" -ErrorAction SilentlyContinue
                foreach ($s in $scriptsDirs) {
                    $installedScriptsFolders += [PSCustomObject]@{
                        VersionName = $ai.Name
                        ScriptsPath = $s.FullName
                    }
                }
            }
        }
    }
}

if ($installedScriptsFolders.Count -eq 0) {
    Write-Host "[X] Error: Could not locate any Adobe Illustrator installation." -ForegroundColor Red
    Write-Host "    Expected location: C:\Program Files\Adobe\Adobe Illustrator <Version>\Presets\<Locale>\Scripts" -ForegroundColor Gray
    Write-Host "`nPlease verify that Adobe Illustrator is installed on this machine." -ForegroundColor Yellow
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        Write-Host "`nPress any key to exit..." -ForegroundColor Gray
        try { [void][System.Console]::ReadKey($true) } catch {}
    }
    exit 1
}

Write-Host "[+] Detected Adobe Illustrator installations:" -ForegroundColor Green
foreach ($item in $installedScriptsFolders) {
    Write-Host "    * $($item.VersionName) -> $($item.ScriptsPath)" -ForegroundColor Gray
}
Write-Host ""

# 4. Download and Install Script
$successCount = 0

foreach ($target in $installedScriptsFolders) {
    $destinationFile = Join-Path $target.ScriptsPath $scriptName
    Write-Host "[*] Installing to $($target.VersionName)..." -NoNewline
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $destinationFile -UseBasicParsing -TimeoutSec 30
        if (Test-Path $destinationFile) {
            Write-Host " [OK]" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " [FAILED]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [FAILED: $($_.Exception.Message)]" -ForegroundColor Red
    }
}

# 5. Success Message and Instructions
Write-Host ""
if ($successCount -gt 0) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Ai2Psd_Pro installed successfully in $successCount location(s)!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart Adobe Illustrator (if it is currently running)." -ForegroundColor White
    Write-Host "  2. In Illustrator, go to the top menu:" -ForegroundColor White
    Write-Host "     File > Scripts > Ai2Psd_Pro" -ForegroundColor Cyan
    Write-Host "  3. Enjoy fast vector preparation & layered PSD export!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[!] Could not complete installation. Please check your internet connection." -ForegroundColor Red
}

if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    Write-Host "Press any key to close this window..." -ForegroundColor Gray
    try { [void][System.Console]::ReadKey($true) } catch {}
}
