# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-21

### Added
- **Runtime model selection** - Choose TranslateGemma 4B, 12B, or 27B directly in the UI
- **120+ languages** - Full TranslateGemma support with searchable language selector
- **Three-state connection status** - Running/Installed (Idle)/Disconnected with auto-updates every 30s
- **In-app help system** - Comprehensive help modal with prerequisites, usage guide, and troubleshooting
- **Language swap functionality** - Quick ⇄ button to reverse translation direction
- **Custom app icon** - Professional branding across all platforms
- **Model preference persistence** - Selected model saved locally and restored on launch
- **Larger text fields** - Increased size with vertical resize support
- **Responsive design** - Mobile and desktop optimized layout
- **Error handling system** - Clear error messages with retry functionality

### Security
- **Content Security Policy enabled** - Protection against XSS attacks and unauthorized resource loading
- **Input validation** - 100KB maximum text length to prevent DoS attacks
- **HTTP timeouts** - 120s for translations, 10s for status checks
- **Language code validation** - Whitelist validation against 120+ supported codes
- **Error message sanitization** - Production builds hide internal error details
- **Request throttling** - Async mutex lock prevents concurrent translation requests
- **Configurable Ollama URL** - Support for `OLLAMA_URL` environment variable

### Privacy
- **System fonts** - No external font dependencies for true 100% local operation
- **No tracking** - No telemetry, analytics, or cloud services
- **Completely offline** - Works without internet after model download
- **No API keys** - No accounts or authentication required

### Technical
- **Modern UI** - Dark-first design with system fonts and emerald accents
- **Error handling** - Clear error state when switching models, localStorage safety
- **Async compatibility** - Uses `tokio::sync::Mutex` for proper async/await support

### Documentation
- **BUGS.md** - Comprehensive security analysis with all issues documented and fixed
- **README.md** - Complete project overview with security features section
- **SETUP_GUIDE.md** - Detailed installation, troubleshooting, and environment variable configuration
- **CHANGELOG.md** - Version history and changes
- Model comparison table (4B, 12B, 27B options)
- Architecture documentation
- Performance benchmarks

### Tooling
- **create-release.ps1** - Automated GitHub release creation script
- **clean-release-assets.ps1** - Remove installers from specific releases
- **remove-all-releases.ps1** - Remove all releases and tags
- Build scripts: `npm run tauri:dev`, `npm run tauri:clean`, `npm run tauri build`
[0.1.0]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.0
