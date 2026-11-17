# Changelog

All notable changes to **Ai2Psd_Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-Pro] - 2026-11-17

### Added
- **Core Engine**: Fast vector path preparation and layer separation engine for Adobe Illustrator.
- **PSD Export**: Layered PSD output preserving shape layers, vector paths, fills, and hierarchy.
- **ScriptUI Interface**: Custom interactive interface matching Illustrator's Light and Dark theme brightness.
- **License Management**: Automated Hardware ID (HWID) device binding and 7-day periodic verification via Google Apps Script backend.
- **1-Click Windows Installer**:
  - `install.ps1`: Automated detection of Adobe Illustrator installations across all locales (`Presets\<Locale>\Scripts`).
  - `install.bat`: Double-click runner for instant setup on Windows.
- **Cross-Platform Compatibility**: Full support for Adobe Illustrator CS6 through 2026+ on Windows & macOS.
