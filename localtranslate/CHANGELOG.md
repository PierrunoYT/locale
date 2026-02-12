# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.4] - 2026-02-12

### Added
- **Enhanced info modal** - Now displays all three TranslateGemma models (4B, 12B, 27B) with installation commands for each
- **Improved help button** - Info button now shows "Help" text alongside the info icon for better discoverability
- **Quick troubleshooting section** - Added dedicated troubleshooting commands in the help modal (ollama serve, ollama ps, ollama list)

### Changed
- **Three-state connection status** - Status badge now distinguishes between:
  - "Running" (green) - Model is loaded in memory and ready
  - "Installed (Idle)" (amber) - Model is installed but not currently loaded
  - "Ollama Disconnected" (red) - Ollama is not reachable
- **More informative status messages** - Changed "Connected" to "Running" for clarity
- **Better usage instructions** - Info modal now includes model selection as the first step

### Backend (Rust)
- Enhanced `check_ollama_status` to return "running" or "installed" status by checking `/api/ps` endpoint
- Improved model state detection to differentiate between installed and actively loaded models

## [0.1.3] - 2026-02-12

### Added
- **Model switcher** - Select TranslateGemma `4b`, `12b`, or `27b` directly in the UI
- **Model preference persistence** - Selected model is saved locally and restored on app launch

### Changed
- **Dynamic model usage** - Translation requests and model health checks now use the selected model instead of a hardcoded `12b`
- **Status and helper text** - Connection badge, loading text, and setup instructions now reflect the selected model

### Backend (Rust)
- `translate_text` now accepts an optional `model` parameter
- `check_ollama_status` now accepts an optional `model` parameter
- Added allowlist validation for supported model tags: `translategemma:4b`, `translategemma:12b`, `translategemma:27b`

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

[0.1.4]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.4
[0.1.3]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.3
[0.1.2]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.2
[0.1.1]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.1
[0.1.0]: https://github.com/PierrunoYT/locale/releases/tag/v0.1.0
