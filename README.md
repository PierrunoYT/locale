# [Locale](https://github.com/PierrunoYT/locale)

A minimal, local translation application built with Tauri, React, and TypeScript. Powered by **TranslateGemma** (4B/12B/27B) for professional-quality translation that runs entirely on your machine.

**Version**: 0.1.0 | **Status**: Production Ready | **License**: MIT

![Locale App Screenshot](assets/app-screenshot.png)

## Features

- 🤖 **Runtime model switch** - Choose TranslateGemma 4B, 12B, or 27B directly in the UI
- 🌍 **120+ languages** - Full TranslateGemma support with searchable language selector
- 🔄 **Quick language swap** functionality
- 🟢 **Live connection status** - Status badge updates every 30s and when you return to the app
- ℹ️ **How it works** - Info button in the header with a quick guide
- 🎨 **Modern UI** - Dark-first design with Plus Jakarta Sans, emerald accents, and light mode support
- 📱 **Responsive design** - Resizable text fields, translate button adapts to screen size
- ⚡ **Fast and lightweight** desktop application
- 🔒 **100% Local processing** - Your data never leaves your machine
- 🔓 **Privacy-focused** - No API keys, no cloud services, no tracking
- 🆓 **Completely free** - No subscription or usage limits

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Framework**: Tauri 2
- **Build Tool**: Vite 7
- **Styling**: CSS3 with CSS Variables
- **Translation Engine**: TranslateGemma via Ollama (4B/12B/27B)
- **Backend**: Rust with async HTTP client

## Prerequisites

### Required
- **Node.js** (v18 or higher)
- **Rust** (latest stable)
- **Ollama** - Download from [ollama.com](https://ollama.com/download)
- **At least one TranslateGemma model** - Install via Ollama (see setup below)

### System Requirements
- **RAM**: 16GB+ recommended (8GB minimum with 4B model)
- **Disk Space**: 10GB free (for model storage)
- **OS**: Windows, macOS, or Linux

## Quick Start

### 1. Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com/download), then verify:

```bash
ollama --version
```

### 2. Install a TranslateGemma model

```bash
ollama run translategemma:4b
```

This downloads the selected model and starts Ollama. `4b` is the lightest option; `12b` and `27b` are available for higher quality.

### 3. Install Locale

```bash
git clone https://github.com/PierrunoYT/locale
cd locale/localtranslate
npm install
```

### 4. Run the Application

```bash
npm run tauri:dev
```

You should see a status badge indicating the model state:
- 🟢 **Running** - Model is loaded and ready
- 🟠 **Installed (Idle)** - Model is installed but not loaded (will auto-load on first translation)
- 🔴 **Disconnected** - Ollama is not running

> **Note:** The app works in both "Running" and "Installed (Idle)" states. When idle, the first translation takes 3-5 seconds as Ollama loads the model into memory, then subsequent translations are fast (~1-2 seconds).

### Build Scripts

- **`npm run tauri:dev`** - Normal development mode (hot reload)
- **`npm run tauri:clean`** - Clean rebuild (clears all caches - use if changes aren't showing)

## Development

**Start development mode:**
```bash
npm run tauri:dev
```

**If changes aren't showing (cache issues):**
```bash
npm run tauri:clean  # Clears all caches and rebuilds
```

**Common cache issues:**
- Rust changes not updating → Delete `src-tauri/target/` folder
- React/Vite changes not updating → Delete `node_modules/.vite/` folder
- Both not updating → Use `npm run tauri:clean`

## Building

Build the production desktop app:
```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

**Build artifacts:**
- Windows: `.exe` installer
- macOS: `.dmg` and `.app`
- Linux: `.deb`, `.AppImage`

## Project Structure

```
localtranslate/
├── src/                 # React frontend source
│   ├── App.tsx         # Main application component
│   ├── App.css         # Application styles
│   ├── LanguageSelect.tsx  # Searchable language selector
│   ├── languages.ts    # Full language list (120+)
│   └── main.tsx        # React entry point
├── src-tauri/          # Rust backend source
│   └── src/            # Rust source files
├── public/             # Static assets
└── package.json        # Node.js dependencies
```

## Usage

1. **Start Ollama** (if not already running):
   ```bash
   ollama serve
   ```

2. **Launch Locale** and wait for the connection indicator (updates every 30s and when you return to the app)

3. **Translate:** (click the ℹ️ **Help** button in the header for a complete guide)
   - Select a model from the **Model** dropdown (4B/12B/27B)
   - Click a language button to open the searchable dropdown
   - Search by name or code (e.g., "spanish", "ja", "arabic")
   - Select source and target languages
   - Enter text in the left panel
   - Click **"Translate"**
   - Translation appears in the right panel

4. **Swap Languages:** Use the ⇄ button to quickly reverse translation direction

## Supported Languages

**120+ languages available** with searchable dropdowns. All TranslateGemma-supported languages including:

- **European:** English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Russian, Ukrainian, Polish, Czech, Greek, Turkish, and more
- **Asian:** Chinese, Japanese, Korean, Hindi, Thai, Vietnamese, Indonesian, Malay, Persian, Arabic, Hebrew, and more
- **Other:** Swahili, Yoruba, Zulu, Amharic, Bengali, Tamil, and 80+ additional languages

Use the search box in each language selector to quickly find any language by name or code.

## Translation Quality

TranslateGemma 12B delivers professional-grade translation quality:
- ✅ **Outperforms larger models** on standardized translation benchmarks
- ✅ **Context-aware** translations with cultural sensitivity
- ✅ **Maintains nuance** and idiomatic expressions
- ✅ **128K token context window** for long documents

## Performance

- **First translation**: ~3-5 seconds (model loading)
- **Subsequent translations**: ~1-2 seconds
- **Memory usage**: ~8GB RAM during translation
- **Offline capable**: Works without internet after model download

### Performance Tips

1. **First translation is slower** - Ollama loads the model into memory (3-5 seconds)
2. **Subsequent translations are fast** - Model stays loaded (~1-2 seconds)
3. **Keep Ollama running** - Start `ollama serve` on system boot for instant translations
4. **Use appropriate model** - Don't use 27B if 4B meets your needs

## Security & Privacy

### Privacy First
- ✅ No data sent to cloud services
- ✅ No API keys or account required
- ✅ No usage tracking or telemetry
- ✅ Works completely offline
- ✅ No external dependencies (uses system fonts)

### Security Features
- ✅ Content Security Policy enabled
- ✅ Input validation (100KB max text length)
- ✅ HTTP request timeouts configured
- ✅ Language code whitelist validation
- ✅ Request throttling (one translation at a time)
- ✅ Sanitized error messages in production

### Cost Effective
- ✅ Zero API costs
- ✅ No subscription fees
- ✅ Unlimited translations
- ✅ One-time setup

### Quality & Control
- ✅ Professional translation quality
- ✅ Consistent results
- ✅ Full control over model selection
- ✅ Open source transparency

## Advanced Configuration

### Installing Multiple Models

You can install all three models and switch between them in the app:

```bash
ollama run translategemma:4b
ollama run translategemma:12b
ollama run translategemma:27b
```

Then use the Model dropdown to switch between them without any code changes.

### Custom Ollama URL

**OLLAMA_URL** - Override the default Ollama API endpoint:
```bash
# Default: http://localhost:11434
# Example: Ollama on a different machine
export OLLAMA_URL="http://192.168.1.100:11434"
npm run tauri:dev

# Windows (PowerShell)
$env:OLLAMA_URL="http://192.168.1.100:11434"
npm run tauri:dev
```

This allows connecting to Ollama running on a different machine or port.

### Ollama Storage Location

Ollama stores models in:
- **Windows**: `C:\Users\<username>\.ollama\models`
- **macOS**: `~/.ollama/models`
- **Linux**: `~/.ollama/models`

### Uninstalling a Model

```bash
ollama rm translategemma:12b
```

## Troubleshooting

### "Ollama Disconnected" Status

**Problem**: Red badge showing "Ollama Disconnected"

**Solution**:
```bash
ollama serve
```

Then click **Retry Connection** in the app, or wait for the automatic status check (every 30 seconds).

### "Model not found" Error

**Problem**: Error message saying the model isn't installed

**Solution**: Install the model you selected in the dropdown:
```bash
# For 4B model
ollama run translategemma:4b

# For 12B model
ollama run translategemma:12b

# For 27B model
ollama run translategemma:27b
```

### "Installed (Idle)" Status

**Problem**: Amber badge showing model is installed but not loaded

**What it means**: The model exists but isn't currently in memory. This is normal when Ollama hasn't been used recently.

**Solution**: Just click **Translate** - Ollama will load the model automatically (takes 3-5 seconds on first translation).

### Slow Performance / Out of Memory

**Problem**: Translations are very slow or system runs out of memory

**Solution**: Switch to a smaller model:

1. Install the 4B model:
   ```bash
   ollama run translategemma:4b
   ```

2. Select **TranslateGemma 4B** from the Model dropdown in the app

3. No code changes or rebuilds required!

### Changes Not Showing in Development

**Problem**: Code changes don't appear when running `npm run tauri:dev`

**Solution**: Clear all caches and rebuild:
```bash
npm run tauri:clean
```

This clears both Rust and Vite caches and rebuilds everything.

### Port Already in Use

**Problem**: Error about port 1420 already being in use

**Solution**:
```bash
# Kill the existing process
# Windows:
taskkill /F /IM locale.exe

# macOS/Linux:
killall locale
```

Then run `npm run tauri:dev` again.

### Check Ollama Status

```bash
# Check if Ollama is running
ollama ps

# Check Ollama version
ollama --version

# See all installed models
ollama list
```

## Model Options

| Model | Download Size | RAM Required | Speed | Quality | Best For |
|-------|---------------|--------------|-------|---------|----------|
| **4B** | 3.3GB | 8GB | Fastest | Good | Daily use, quick translations |
| **12B** | 8.1GB | 16GB | Fast | Excellent ⭐ | Professional work, balanced performance |
| **27B** | 17GB | 32GB | Slower | Best | Critical translations, maximum accuracy |

**Default:** 4B (fastest and most accessible)

**Recommendation**: Start with 4B for testing, upgrade to 12B for regular use if you have the RAM.

### Change Translation Model

Use the **Model** dropdown above the language selectors to switch between:
- `translategemma:4b`
- `translategemma:12b`
- `translategemma:27b`

Your selection is saved locally and reused when you reopen the app.

### Add More Languages

Edit `src/languages.ts` to add or modify languages. The app includes all 120+ TranslateGemma-supported languages by default. See [Ollama TranslateGemma docs](https://ollama.com/library/translategemma) for the full list of supported language codes.

**Note**: If adding custom language codes, you must also update the `VALID_LANGUAGE_CODES` whitelist in `src-tauri/src/lib.rs` for security.

## Architecture

```
┌─────────────────┐
│   React UI      │  User Interface (TypeScript)
└────────┬────────┘
         │
    Tauri Bridge
         │
┌────────▼────────┐
│   Rust Backend  │  HTTP Client + Translation Logic
└────────┬────────┘
         │
   HTTP Request
         │
┌────────▼────────┐
│     Ollama      │  Local API Server
└────────┬────────┘
         │
┌────────▼────────┐
│ TranslateGemma  │  AI Translation Model
│ 4B/12B/27B      │  (Runs locally on your machine)
└─────────────────┘
```

## Contributing

Contributions are welcome! Areas for improvement:
- Additional language support in UI
- Translation history/favorites
- Batch translation support
- Custom terminology/glossaries
- UI/UX enhancements

Please feel free to submit a [Pull Request](https://github.com/PierrunoYT/locale/pulls).

## Version History

See [CHANGELOG.md](localtranslate/CHANGELOG.md) for detailed release notes.

**Current Version**: 0.1.0 (2026-02-21)
- Runtime model selection (4B/12B/27B)
- Three-state connection status (Running/Installed/Disconnected)
- Comprehensive security hardening (CSP, input validation, timeouts)
- 100% local operation with no external dependencies
- In-app help system and modern UI

## License

This project is licensed under the [MIT License](LICENSE).

TranslateGemma model is subject to the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).

## Resources

- [GitHub Repository](https://github.com/PierrunoYT/locale)
- [TranslateGemma Model](https://ollama.com/library/translategemma)
- [Ollama Documentation](https://docs.ollama.com)
- [Tauri Documentation](https://tauri.app)
- [Report Issues](https://github.com/PierrunoYT/locale/issues)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

**Built with ❤️ using TranslateGemma, Tauri, React, and Rust**
