<#
.SYNOPSIS
    1-Click Installer & Updater for Ai2Psd_Pro (Adobe Illustrator Script).
.DESCRIPTION
    Detects all installed versions of Adobe Illustrator on Windows,
    removes any older Ai2Psd_Pro.jsx or Ai2Psd_Pro.jsxbin files, downloads
    the latest Ai2Psd_Pro.jsx (or .jsxbin if available) from GitHub, and installs
    it cleanly while fully preserving user license files in Documents\Adobe Scripts.
.AUTHOR
    Mujahidul Islam (mujahidul80)
    https://github.com/mujahidul80/Ai2Psd_Pro
#>

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 1. Administrator Rights Check & Self-Elevation
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "`n[*] Administrative privileges are required to install into Program Files." -ForegroundColor Yellow
    Write-Host "[*] Requesting administrator rights (UAC elevation)..." -ForegroundColor Cyan
    
    $oneLiner = "irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"
    try {
        if ($MyInvocation.MyCommand.Path) {
            Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
        } else {
            Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"$oneLiner`""
        }
    } catch {
        Write-Host "[X] Administrator access was denied. Please run PowerShell as Administrator and try again." -ForegroundColor Red
    }
    exit
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Ai2Psd_Pro - 1-Click Installer for Adobe Illustrator  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Configuration & GitHub Repository
$repoOwner = "mujahidul80"
$repoName  = "Ai2Psd_Pro"
$branch    = "main"
$rawBase   = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch"

$jsxbinUrl = "$rawBase/Ai2Psd_Pro.jsxbin"
$jsxUrl    = "$rawBase/Ai2Psd_Pro.jsx"

# 3. Locate Adobe Illustrator Installations
$searchRoots = @(
    "C:\Program Files\Adobe",
    (Join-Path ${env:ProgramFiles} "Adobe"),
    (Join-Path ${env:SystemDrive} "Program Files\Adobe"),
    "C:\Program Files (x86)\Adobe",
    "D:\Program Files\Adobe"
) | Select-Object -Unique

$installedScriptsFolders = @()

foreach ($root in $searchRoots) {
    if (Test-Path $root) {
        $aiDirs = Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -like "*Illustrator*"
        }
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

# Deduplicate targets
$installedScriptsFolders = $installedScriptsFolders | Sort-Object -Property ScriptsPath -Unique

if ($installedScriptsFolders.Count -eq 0) {
    Write-Host "[X] Error: Could not locate any Adobe Illustrator installation." -ForegroundColor Red
    Write-Host "    Expected location: C:\Program Files\Adobe\Adobe Illustrator <Version>\Presets\<Locale>\Scripts" -ForegroundColor Gray
    Write-Host "`nPlease verify that Adobe Illustrator is installed on this machine." -ForegroundColor Yellow
    if ([Environment]::UserInteractive) {
        Write-Host "`nPress Enter to exit..." -ForegroundColor Gray
        try { [void](Read-Host) } catch {}
    }
    exit 1
}

Write-Host "[+] Detected Adobe Illustrator installations:" -ForegroundColor Green
foreach ($item in $installedScriptsFolders) {
    Write-Host "    * $($item.VersionName) -> $($item.ScriptsPath)" -ForegroundColor Gray
}
Write-Host ""

# 4. Download Latest Script (Prefer .jsxbin if available, fallback to .jsx)
Write-Host "[*] Checking for latest release files on GitHub ($repoOwner/$repoName)..." -ForegroundColor Cyan

$targetFileName   = $null
$tempDownloadPath = $null
$tempDir          = [System.IO.Path]::GetTempPath()

# Check if compiled binary (.jsxbin) is available on GitHub
$useJsxbin = $false
try {
    $headCheck = Invoke-WebRequest -Uri $jsxbinUrl -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($headCheck.StatusCode -eq 200) {
        $useJsxbin = $true
    }
} catch {
    $useJsxbin = $false
}

if ($useJsxbin) {
    $candidateTemp = Join-Path $tempDir "Ai2Psd_Pro_download.jsxbin"
    try {
        Write-Host "    Found compiled binary. Downloading Ai2Psd_Pro.jsxbin..." -ForegroundColor White
        Invoke-WebRequest -Uri $jsxbinUrl -OutFile $candidateTemp -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        if ((Test-Path $candidateTemp) -and ((Get-Item $candidateTemp).Length -gt 100)) {
            $targetFileName   = "Ai2Psd_Pro.jsxbin"
            $tempDownloadPath = $candidateTemp
        }
    } catch {
        Write-Host "    [!] Warning: Could not download .jsxbin, falling back to .jsx..." -ForegroundColor Yellow
    }
}

# Fallback or standard download: Ai2Psd_Pro.jsx
if (-not $tempDownloadPath) {
    $candidateTemp = Join-Path $tempDir "Ai2Psd_Pro_download.jsx"
    Write-Host "    Downloading script: Ai2Psd_Pro.jsx..." -ForegroundColor White
    try {
        Invoke-WebRequest -Uri $jsxUrl -OutFile $candidateTemp -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        if ((Test-Path $candidateTemp) -and ((Get-Item $candidateTemp).Length -gt 100)) {
            $targetFileName   = "Ai2Psd_Pro.jsx"
            $tempDownloadPath = $candidateTemp
        } else {
            throw "Downloaded file is invalid or empty."
        }
    } catch {
        Write-Host "[X] Error downloading script from GitHub: $($_.Exception.Message)" -ForegroundColor Red
        if ([Environment]::UserInteractive) {
            Write-Host "`nPress Enter to exit..." -ForegroundColor Gray
            try { [void](Read-Host) } catch {}
        }
        exit 1
    }
}

$fileSizeKb = [math]::Round((Get-Item $tempDownloadPath).Length / 1KB, 1)
Write-Host "[+] Successfully downloaded $targetFileName ($fileSizeKb KB)." -ForegroundColor Green
Write-Host ""

# 5. Clean Old Versions & Install Latest File
$successCount = 0

foreach ($target in $installedScriptsFolders) {
    Write-Host "[*] Updating $($target.VersionName)..." -ForegroundColor White

    # Remove any existing Ai2Psd_Pro.jsx or Ai2Psd_Pro.jsxbin cleanly
    $filesToRemove = @("Ai2Psd_Pro.jsx", "Ai2Psd_Pro.jsxbin")
    foreach ($oldName in $filesToRemove) {
        $oldPath = Join-Path $target.ScriptsPath $oldName
        if (Test-Path $oldPath) {
            try {
                Remove-Item -Path $oldPath -Force -ErrorAction Stop
                Write-Host "    [-] Removed old file: $oldName" -ForegroundColor Gray
            } catch {
                Write-Host "    [!] Warning: Could not remove $oldName ($($_.Exception.Message))" -ForegroundColor Yellow
            }
        }
    }

    # Install the latest script file
    $destinationFile = Join-Path $target.ScriptsPath $targetFileName
    try {
        Copy-Item -Path $tempDownloadPath -Destination $destinationFile -Force -ErrorAction Stop
        if (Test-Path $destinationFile) {
            Write-Host "    [+] Installed: $targetFileName [OK]" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "    [X] Installation failed." -ForegroundColor Red
        }
    } catch {
        Write-Host "    [X] Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Preserve and Report License File Status
$userDocs = [Environment]::GetFolderPath('MyDocuments')
$adobeScriptsDir = Join-Path $userDocs "Adobe Scripts"
if (Test-Path $adobeScriptsDir) {
    Write-Host "`n[*] User license & configuration in Documents\Adobe Scripts are safe and preserved." -ForegroundColor Cyan
}

# Clean up temp file
if ($tempDownloadPath -and (Test-Path $tempDownloadPath)) {
    Remove-Item -Path $tempDownloadPath -Force -ErrorAction SilentlyContinue
}

# 7. Summary & Next Steps
Write-Host ""
if ($successCount -gt 0) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Ai2Psd_Pro installed successfully in $successCount location(s)!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart Adobe Illustrator (if it is currently open)." -ForegroundColor White
    Write-Host "  2. In Illustrator, go to the top menu:" -ForegroundColor White
    Write-Host "     File > Scripts > Ai2Psd_Pro" -ForegroundColor Cyan
    Write-Host "  3. Enjoy fast vector preparation & layered PSD export!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[!] Could not complete installation. Please check permissions or network connection." -ForegroundColor Red
}

if ([Environment]::UserInteractive) {
    Write-Host "Press Enter to close this window..." -ForegroundColor Gray
    try { [void](Read-Host) } catch {}
}
