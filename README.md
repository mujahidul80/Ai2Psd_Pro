<div align="center">

# ⚡ Ai2Psd_Pro

### **Fast Vector Path Preparation & High-Fidelity Export from Adobe Illustrator to Layered PSD**

<p align="center">
  <a href="https://github.com/mujahidul80/Ai2Psd_Pro/stargazers"><img src="https://img.shields.io/github/stars/mujahidul80/Ai2Psd_Pro?style=for-the-badge&logo=github&color=007ACC" alt="GitHub Stars" /></a>
  <a href="https://github.com/mujahidul80/Ai2Psd_Pro/releases"><img src="https://img.shields.io/badge/Release-v1.0.0--Pro-brightgreen?style=for-the-badge&logo=tag" alt="Release" /></a>
  <a href="#-compatibility"><img src="https://img.shields.io/badge/Adobe%20Illustrator-CS6%20--%202026%2B-FF9A00?style=for-the-badge&logo=adobeillustrator&logoColor=white" alt="Illustrator" /></a>
  <a href="#-installation"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" /></a>
</p>

---

[🚀 1-Click Install](#-quick-1-click-install-windows) •
[✨ Features](#-key-features) •
[📊 Comparison](#-why-ai2psd_pro) •
[🛠️ Manual Install](#%EF%B8%8F-manual-installation) •
[❓ Troubleshooting](#-troubleshooting--faq) •
[👤 Author](#-author--support)

</div>

---

## 💡 Overview

**Ai2Psd_Pro** is an industrial-strength Adobe Illustrator ExtendScript (`.jsx`) crafted to solve one of the biggest pain points in graphic design: **converting complex Illustrator artwork into clean, perfectly layered Photoshop (`.psd`) files without losing vector fidelity.**

Whether you are preparing vector characters, UI icons, isometric art, or print designs, **Ai2Psd_Pro** automates tedious layer splitting, path decomposition, and group organization with a single click.

```
┌─────────────────────────┐          ┌───────────────────────┐          ┌─────────────────────────┐
│   Adobe Illustrator     │          │      Ai2Psd_Pro       │          │     Adobe Photoshop     │
│   • Nested Groups       │  ──────> │  • Path Optimization  │  ──────> │   • Native PSD Layers   │
│   • Complex Paths       │          │  • Hierarchy Builder  │          │   • Separated Elements  │
│   • Clipping Masks      │          │  • HWID Pro Engine    │          │   • Ready for Export    │
└─────────────────────────┘          └───────────────────────┘          └─────────────────────────┘
```

---

## 📊 Why Ai2Psd_Pro?

| Feature | ❌ Standard Illustrator Export | ⚡ Ai2Psd_Pro |
| :--- | :---: | :---: |
| **Layer Preservation** | Often merges shapes into flat rasters | **Preserves exact layer structure & vectors** |
| **Nested Group Handling** | Flattens sub-elements | **Recursively isolates every element** |
| **Clipping Masks** | Breaks or renders jagged masks | **Intelligently releases & reconstructs masks** |
| **Processing Speed** | Slow manual reorganization (30–60 mins) | **Instant 1-Click Automated Processing** |
| **Adaptive UI** | None (basic dialog) | **Dark & Light Mode ScriptUI interface** |
| **Installation** | Manual folder navigation | **1-Click automated Windows installer** |

---

## 🚀 Quick 1-Click Install (Windows)

No need to find hidden folders or copy files manually. Choose your preferred method below:

### 🔹 Option A: PowerShell (Fastest)
Open **PowerShell** (or Windows Terminal), paste the following command, and hit **Enter**:

```powershell
irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex
```

### 🔹 Option B: Command Prompt (CMD)
```cmd
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.ps1 | iex"
```

### 🔹 Option C: Double-Click File
1. Download [**`install.bat`**](https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/install.bat).
2. Double-click the file to run the installer automatically.

> **💡 What the installer does:**
> - Automatically detects **all** installed Illustrator editions (`Illustrator 2020`, `2024`, `2025`, `2026`, etc.).
> - Discovers any language locale folder (e.g. `Presets\en_US\Scripts`, `Presets\en_GB\Scripts`).
> - Fetches the latest version directly from GitHub into the correct directories.

---

## 🛠️ Manual Installation

If you prefer installing manually or are using macOS:

### 🪟 Windows Manual Steps:
1. Download [`Ai2Psd_Pro.jsx`](https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/Ai2Psd_Pro.jsx).
2. Copy the file into your Illustrator Scripts folder:
   ```text
   C:\Program Files\Adobe\Adobe Illustrator <Version>\Presets\<Locale>\Scripts\
   ```
   *Example: `C:\Program Files\Adobe\Adobe Illustrator 2024\Presets\en_US\Scripts\`*
3. Restart Adobe Illustrator.

### 🍎 macOS Manual Steps:
1. Download [`Ai2Psd_Pro.jsx`](https://raw.githubusercontent.com/mujahidul80/Ai2Psd_Pro/main/Ai2Psd_Pro.jsx).
2. Copy `Ai2Psd_Pro.jsx` to:
   ```text
   /Applications/Adobe Illustrator <Version>/Presets/<Locale>/Scripts/
   ```
3. Restart Adobe Illustrator.

---

## 🎯 How to Use

1. Launch or restart **Adobe Illustrator**.
2. Open the artwork you want to export.
3. In the top navigation bar, navigate to:
   ```text
   File > Scripts > Ai2Psd_Pro
   ```
4. **First-Time Activation**: Enter your registered license key when prompted.
5. Select your export preferences and click **Export to PSD**.

---

## ✨ Key Features

- **⚡ Fast Vector Decomposition**: Automatically splits grouped items and compound paths while maintaining design composition.
- **🎨 Adaptive ScriptUI**: Custom interface with automatic color detection matching Illustrator's Light and Dark brightness settings.
- **🔐 Hardware-Bound Security (HWID)**: Integrated self-registration and automated 7-day periodic license check via cloud backend.
- **📦 Zero External Dependencies**: Runs entirely inside Illustrator's native ExtendScript engine without requiring external plugins.
- **🔄 Multi-Instance Support**: The installer handles multiple side-by-side Illustrator versions simultaneously.

---

## 💻 Compatibility

| Adobe Illustrator Version | Windows Support | macOS Support | Status |
| :--- | :---: | :---: | :---: |
| **Illustrator 2026+** | ✅ | ✅ | **Supported** |
| **Illustrator 2025 (v29.x)** | ✅ | ✅ | **Supported** |
| **Illustrator 2024 (v28.x)** | ✅ | ✅ | **Supported** |
| **Illustrator 2023 (v27.x)** | ✅ | ✅ | **Supported** |
| **Illustrator 2022 (v26.x)** | ✅ | ✅ | **Supported** |
| **Illustrator 2021 (v25.x)** | ✅ | ✅ | **Supported** |
| **Illustrator 2020 (v24.x)** | ✅ | ✅ | **Supported** |
| **Illustrator CC & CS6** | ✅ | ✅ | **Supported** |

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. The script does not show up under <code>File > Scripts</code>?</b></summary>
<br>
Make sure you restarted Adobe Illustrator completely after installation. If it still doesn't show, check that the file is named <code>Ai2Psd_Pro.jsx</code> and is located in the exact <code>Presets\&lt;YourLocale&gt;\Scripts\</code> directory.
</details>

<details>
<summary><b>2. "Administrator Permission Required" error during installation?</b></summary>
<br>
Writing to <code>C:\Program Files</code> on Windows requires administrator permissions. Run your PowerShell or Command Prompt as Administrator, or simply use <code>install.bat</code>.
</details>

<details>
<summary><b>3. How does the Pro license key work?</b></summary>
<br>
Upon first run, enter your activation key. The script computes your unique HWID and validates it securely with the licensing API.
</details>

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome! Please read our [**Contributing Guide**](CONTRIBUTING.md) and feel free to submit issues or pull requests.

---

## 👤 Author & Support

<p align="left">
  <b>Mujahidul Islam</b><br>
  🔗 <b>GitHub</b>: <a href="https://github.com/mujahidul80">@mujahidul80</a><br>
  🌐 <b>Website / Blog</b>: <a href="https://mujahidulib.blogspot.com">mujahidulib.blogspot.com</a><br>
  💬 <b>Issues & Feedback</b>: <a href="https://github.com/mujahidul80/Ai2Psd_Pro/issues">Open an Issue</a>
</p>

---

<div align="center">
  <sub>Built with ❤️ for Adobe Illustrator designers worldwide • © 2026 Mujahidul Islam</sub>
</div>
