# Ai2Psd_Pro

<p align="center">
  <b>Fast vector path preparation & high-fidelity export from Adobe Illustrator to layered PSD.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Illustrator-CS6%20--%202026%2B-orange?style=flat-square" alt="Illustrator Compatibility" />
  <img src="https://img.shields.io/badge/License-Pro-green?style=flat-square" alt="License" />
</p>

---

## 📖 Overview

**Ai2Psd_Pro** is an advanced ExtendScript (`.jsx`) tool for **Adobe Illustrator** that streamlines the vector-to-raster pipeline. It cleans up paths, decomposes complex groups, and prepares artwork for seamless conversion into clean, editable, layered Adobe Photoshop (`.psd`) files.

Designed for graphic designers, digital artists, and production agencies looking to save hours of manual layer splitting and path cleanup.

---

## ✨ Key Features

- **⚡ 1-Click Vector Preparation**: Automatically flattens, prepares, and optimizes vector shapes for PSD export.
- **📁 True Layer Preservation**: Converts Illustrator layers, sublayers, and compound paths into organized Photoshop layers.
- **🎨 Custom Modern ScriptUI**: Sleek, responsive interface with adaptive light/dark mode matching Illustrator's UI brightness.
- **🔒 Pro License & HWID Integration**: Built-in automated license validation and 7-day online checks.
- **🚀 Multi-Version Compatibility**: Works seamlessly across Adobe Illustrator CS6, CC, 2020, 2021, 2022, 2023, 2024, 2025, and 2026+.

---

## ⚡ Quick 1-Click Install (Windows)

You can install **Ai2Psd_Pro** instantly without manual file copying.

### Using PowerShell:
Open **PowerShell** (or Windows Terminal) and paste the following command, then press **Enter**:

```powershell
irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex
```

### Using Command Prompt (CMD):
```cmd
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"
```

> **What the installer does automatically:**
> - Detects all installed Adobe Illustrator versions (`C:\Program Files\Adobe\Adobe Illustrator <Version>`).
> - Locates the exact language/locale scripts directory (e.g., `Presets\en_US\Scripts`).
> - Requests elevation if needed and downloads the latest `Ai2Psd_Pro.jsx`.

---

## 🛠️ Manual Installation

If you prefer installing manually or are using macOS:

### Windows:
1. Download [`Ai2Psd_Pro.jsx`](https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/Ai2Psd_Pro.jsx).
2. Copy `Ai2Psd_Pro.jsx` into your Illustrator Scripts folder:
   ```text
   C:\Program Files\Adobe\Adobe Illustrator <Version>\Presets\<Locale>\Scripts\
   ```
   *(Example: `C:\Program Files\Adobe\Adobe Illustrator 2024\Presets\en_US\Scripts\`)*
3. Restart Adobe Illustrator.

### macOS:
1. Download [`Ai2Psd_Pro.jsx`](https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/Ai2Psd_Pro.jsx).
2. Copy `Ai2Psd_Pro.jsx` to:
   ```text
   /Applications/Adobe Illustrator <Version>/Presets/<Locale>/Scripts/
   ```
3. Restart Adobe Illustrator.

---

## 🚀 How to Run in Illustrator

1. Launch or restart **Adobe Illustrator**.
2. Open any vector artwork.
3. Go to the top menu bar:
   ```text
   File > Scripts > Ai2Psd_Pro
   ```
4. Enter your license key when prompted (first time only) and choose your export settings.

---

## 👤 Author & Support

- **Author**: Mujahidul Islam ([@mujahidul80](https://github.com/mujahidul80))
- **Support & Updates**: [mujahidulib.blogspot.com](https://mujahidulib.blogspot.com)
- **Report Issues**: [GitHub Issues](https://github.com/mujahidul80/Ai2Psd_Pro/issues)
