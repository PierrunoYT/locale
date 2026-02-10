# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Connection status accuracy** - Status badge now updates correctly when Ollama is not running. Previously it could show "connected" when Ollama was stopped or disconnected. Added periodic health checks (every 30 seconds) and re-check when the window regains focus so the badge always reflects the current state.

## [0.1.0] - 2026-01-28

### Added
- Initial release of LocalTranslate with **TranslateGemma 12B integration**
- Full AI-powered translation via Ollama (local, privacy-focused)
- Language selector dropdowns for source and target languages
- Support for 8 languages: English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese (55+ supported by model)
- Language swap functionality
- Dual-pane text input/output areas
- Translate button with loading states
- Dark mode support (automatic based on system preference)
- Responsive design for mobile and desktop
- Clean, modern UI with smooth transitions
- **Connection status indicator** - Real-time Ollama/model status badge
- **Error handling system** - Clear error messages with retry functionality
- **Model verification** - Checks both Ollama connection and model installation

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

[0.1.0]: https://github.com/PierrunoYT/localtranslate/releases/tag/v0.1.0
