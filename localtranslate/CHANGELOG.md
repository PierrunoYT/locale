# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-02-10

### Changed
- **Larger text fields** - Increased default size and added vertical resize support
- **Translate button** - Moved directly under the text fields with responsive full-width layout on mobile

## [0.1.1] - 2026-02-10

### Added
- **Info button** - "How it works" modal in the header explaining prerequisites, usage steps, connection status, and privacy
- **New logo** - Custom app icon for window, taskbar, and installers

## [0.1.0] - 2026-01-28

### Added
- Initial release of **Locale** with **TranslateGemma 12B integration**
- Full AI-powered translation via Ollama (local, privacy-focused)
- **120+ languages** - All TranslateGemma-supported languages available in the UI
- **Searchable language selector** - Search languages by name or code (e.g., "spanish", "ja") in dropdown menus
- Language swap functionality
- Dual-pane text input/output areas with language labels
- Translate button with loading states
- Dark mode and light mode support (automatic based on system preference)
- Responsive design for mobile and desktop
- **Connection status indicator** - Real-time Ollama/model status badge with periodic health checks (every 30s) and re-check on window focus
- **Error handling system** - Clear error messages with retry functionality
- **Model verification** - Checks both Ollama connection and model installation

### Fixed
- **Connection status accuracy** - Status badge now updates correctly when Ollama is not running. Added periodic health checks (every 30 seconds) and re-check when the window regains focus.

### Changed
- **Modern UI redesign** - Dark-first theme with Plus Jakarta Sans typography, emerald accents, pill-style status badges, and language labels above text areas. Light mode supported via system preference.

### Backend (Rust)
- Tauri 2 framework with Rust backend
- `reqwest` HTTP client for Ollama API communication
- `tokio` async runtime for non-blocking operations
- `translate_text` command - Calls TranslateGemma 12B for translation
- `check_ollama_status` command - Verifies Ollama is running and model is installed
- Professional prompt engineering following TranslateGemma specifications
- Comprehensive error handling for connection and API issues

### Frontend (React + TypeScript)
- React 19 + TypeScript
- Real-time translation state management
- Searchable language dropdown component
- Connection status badge (green=connected, red=disconnected)
- Error message display with actionable guidance
- "Retry Connection" button for recovery
- Loading states during translation
- Automatic status check on app launch
- Form controls disabled during active translation

### Technical Stack
- **Frontend**: React 19 + TypeScript + Vite 7
- **Backend**: Rust + Tauri 2
- **Translation Engine**: TranslateGemma 12B via Ollama
- **API**: Ollama HTTP API (localhost:11434)
- **Styling**: CSS3 with CSS Variables
- **Dependencies**: reqwest@0.12, tokio@1

### Documentation
- Comprehensive README with integration details
- SETUP_GUIDE with installation and troubleshooting
- Model comparison table (4B, 12B, 27B options)
- Architecture documentation
- Performance benchmarks

### Build Scripts
- `npm run tauri:dev` - Normal development mode
- `npm run tauri:clean` - Clean rebuild (clears all caches)

### Requirements
- Ollama must be installed and running
- TranslateGemma 12B model must be downloaded: `ollama run translategemma:12b`
- Minimum 16GB RAM recommended (8GB with 4B model)
- 10GB free disk space for model

### Performance
- First translation: ~3-5 seconds (model loading)
- Subsequent translations: ~1-2 seconds
- Memory usage: ~8GB RAM during translation
- Context window: 128K tokens
- Offline capable after model download

### Privacy & Security
- ✅ 100% local processing - no cloud API calls
- ✅ No data sent to external servers
- ✅ No API keys or accounts required
- ✅ Works completely offline
- ✅ Open source and transparent

[0.1.2]: https://github.com/PierrunoYT/localtranslate/releases/tag/v0.1.2
[0.1.1]: https://github.com/PierrunoYT/localtranslate/releases/tag/v0.1.1
[0.1.0]: https://github.com/PierrunoYT/localtranslate/releases/tag/v0.1.0
