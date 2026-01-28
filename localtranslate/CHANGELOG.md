# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-01-28

### Added - TranslateGemma 12B Integration 🚀
- **Full TranslateGemma 12B integration** via Ollama for local, privacy-focused translation
- **Real translation engine** - Replaced mockup with actual AI-powered translation
- **Ollama connection status indicator** - Live connection status badge in header (green/red)
- **Error handling system** - Comprehensive error messages with retry functionality
- **Async translation support** - Non-blocking translation with loading states
- **Connection health check** - Automatic Ollama status verification on app launch
- **Professional prompt engineering** - Uses TranslateGemma's required prompt format with language names and cultural sensitivity guidelines

### Backend (Rust)
- Added `reqwest` HTTP client for Ollama API communication
- Added `tokio` async runtime for non-blocking operations
- Implemented `translate_text` Tauri command with proper error handling
- Implemented `check_ollama_status` command for connection verification
- Built translation prompt template builder following TranslateGemma specifications
- Structured JSON request/response handling for Ollama API
- Language name mapping system for professional prompt formatting

### Frontend (React + TypeScript)
- Added real-time translation state management (`isTranslating`, `error`, `ollamaStatus`)
- Integrated Tauri API invoke system for backend communication
- Added connection status badge component (connected/disconnected states)
- Implemented error message display with pre-formatted text support
- Added "Retry Connection" button for connection recovery
- Disabled form controls during active translation
- Added loading state feedback ("Translating with TranslateGemma 12B...")
- Implemented automatic Ollama status check on component mount

### UI/UX Improvements
- **Status indicator** - Visual connection status with color-coded badges
- **Loading states** - Clear feedback during translation process
- **Error handling** - User-friendly error messages with actionable guidance
- **Disabled states** - Prevents multiple simultaneous translation requests
- **Dark mode support** - Extended dark mode styles for new components
- **Responsive design** - Status indicators adapt to screen size

### Documentation
- Created comprehensive `SETUP_GUIDE.md` with installation instructions
- Created `QUICK_START.md` for rapid setup (5-minute guide)
- Updated main `README.md` with TranslateGemma integration details
- Added troubleshooting section for common issues
- Documented model options (4B, 12B, 27B) with comparison table
- Added architecture diagram showing data flow
- Included performance benchmarks and system requirements

### Changed
- Updated app description to emphasize local translation capabilities
- Enhanced language list with 55+ language support documentation
- Modified translation button to show loading state
- Improved header layout to accommodate status indicator
- Added comprehensive `.gitignore` file at root level
- Removed `package-lock.json` from git tracking (now properly ignored)
- Improved project structure by properly ignoring build artifacts, dependencies, and temporary files

### Technical Details
- **Ollama API endpoint**: `http://localhost:11434/api/chat`
- **Model**: `translategemma:12b` (8.1GB, 128K context window)
- **Prompt format**: Professional translator system prompt with source/target language specifications
- **Error handling**: Connection errors, model availability, and API response parsing
- **Dependencies**: Added `reqwest@0.12` and `tokio@1` to Cargo.toml

### Performance
- First translation: ~3-5 seconds (includes model loading)
- Subsequent translations: ~1-2 seconds
- Memory usage: ~8GB RAM during translation
- Context window: 128K tokens
- Offline capable after initial model download

### Privacy & Security
- ✅ 100% local processing - no cloud API calls
- ✅ No data sent to external servers
- ✅ No API keys or accounts required
- ✅ Works completely offline
- ✅ Open source and transparent

### Fixed
- Removed placeholder/mockup translation implementation
- Resolved translation functionality (now fully operational)

## [0.1.0] - 2026-01-28

### Added
- Initial release of LocalTranslate
- Minimal UI mockup with translation interface
- Language selector dropdowns for source and target languages
- Support for 8 languages: English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese
- Language swap functionality
- Dual-pane text input/output areas
- Translate button
- Dark mode support (automatic based on system preference)
- Responsive design for mobile and desktop
- Clean, modern UI with smooth transitions

### Technical
- React 19 + TypeScript setup
- Tauri 2 framework integration
- Vite 7 build configuration
- CSS3 styling with CSS variables
- Component-based architecture

### Known Issues
- ~~Translation functionality is currently a mockup (placeholder implementation)~~ ✅ Fixed in v0.2.0
- ~~Actual translation engine integration pending~~ ✅ Fixed in v0.2.0

### Requirements
- Ollama must be installed and running
- TranslateGemma 12B model must be downloaded
- Minimum 16GB RAM recommended (8GB with 4B model)

[0.2.0]: https://github.com/pierr/LocalTranslate/releases/tag/v0.2.0
[0.1.0]: https://github.com/pierr/LocalTranslate/releases/tag/v0.1.0
