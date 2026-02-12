# Locale Setup Guide

**Version**: 0.1.4 | Complete setup guide for TranslateGemma translation

## System Requirements

- **RAM**: 16GB+ recommended (8GB minimum with 4B model)
- **Disk Space**: 10GB free for model storage
- **OS**: Windows, macOS, or Linux
- **Node.js**: v18 or higher
- **Rust**: Latest stable version

## Quick Installation

### 1. Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com/download)

```bash
# Verify installation
ollama --version
```

### 2. Install a TranslateGemma Model

Choose one based on your system resources:

```bash
# Fastest - requires 8GB RAM (recommended for most users)
ollama run translategemma:4b

# Balanced - requires 16GB RAM
ollama run translategemma:12b

# Best quality - requires 32GB RAM
ollama run translategemma:27b
```

The model will download (~3-17GB depending on version) and start automatically.

### 3. Clone and Install Locale

```bash
git clone https://github.com/PierrunoYT/locale
cd locale/localtranslate
npm install
```

### 4. Run the Application

```bash
npm run tauri:dev
```

The app will open and show a status badge:
- 🟢 **Running** - Model is loaded and ready to translate
- 🟠 **Installed (Idle)** - Model is installed but not currently loaded
- 🔴 **Disconnected** - Ollama is not running

## Using Locale

### Selecting a Model

1. Click the **Model** dropdown at the top
2. Choose from:
   - **TranslateGemma 4B** - Fastest, 8GB RAM
   - **TranslateGemma 12B** - Balanced, 16GB RAM
   - **TranslateGemma 27B** - Best quality, 32GB RAM
3. Your selection is saved automatically

**Note**: Make sure the model you select is installed via Ollama first!

### Translating Text

1. Select source and target languages from the dropdowns
2. Type or paste text in the left panel
3. Click **Translate**
4. Translation appears in the right panel

### Using the Help Button

Click the **ℹ️ Help** button in the header for:
- Prerequisites and installation commands
- Step-by-step usage instructions
- Connection status explanations
- Quick troubleshooting commands

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

## Model Comparison

| Model | Download Size | RAM Required | Speed | Quality | Best For |
|-------|--------------|--------------|-------|---------|----------|
| **4B** | 3.3GB | 8GB | Fastest | Good | Daily use, quick translations |
| **12B** | 8.1GB | 16GB | Fast | Excellent ⭐ | Professional work, balanced performance |
| **27B** | 17GB | 32GB | Slower | Best | Critical translations, maximum accuracy |

**Recommendation**: Start with 4B for testing, upgrade to 12B for regular use if you have the RAM.

## Building for Production

### Development Build

```bash
npm run tauri:dev
```

### Production Build

```bash
npm run tauri build
```

Built files will be in `src-tauri/target/release/bundle/`:
- **Windows**: `.msi` and `.exe` installers
- **macOS**: `.dmg` and `.app` bundle
- **Linux**: `.deb` and `.AppImage`

## Advanced Configuration

### Installing Multiple Models

You can install all three models and switch between them:

```bash
ollama run translategemma:4b
ollama run translategemma:12b
ollama run translategemma:27b
```

Then use the Model dropdown to switch between them without any code changes.

### Checking Installed Models

```bash
# See all installed models
ollama list

# See currently loaded models
ollama ps
```

### Uninstalling a Model

```bash
ollama rm translategemma:12b
```

### Ollama Configuration

Ollama stores models in:
- **Windows**: `C:\Users\<username>\.ollama\models`
- **macOS**: `~/.ollama/models`
- **Linux**: `~/.ollama/models`

## Performance Tips

1. **First translation is slower** - Ollama loads the model into memory (3-5 seconds)
2. **Subsequent translations are fast** - Model stays loaded (~1-2 seconds)
3. **Keep Ollama running** - Start `ollama serve` on system boot for instant translations
4. **Use appropriate model** - Don't use 27B if 4B meets your needs

## Getting Help

### In-App Help

Click the **ℹ️ Help** button for quick reference.

### Check Logs

Development mode shows logs in the terminal.

### Ollama Logs

```bash
# Check if Ollama is running
ollama ps

# Check Ollama version
ollama --version
```

### GitHub Issues

Report bugs or request features: [GitHub Issues](https://github.com/PierrunoYT/locale/issues)

## Privacy & Security

- ✅ **100% local processing** - No data sent to cloud
- ✅ **No API keys required** - No accounts or authentication
- ✅ **Works offline** - After model download
- ✅ **Open source** - Transparent and auditable

## Resources

- [GitHub Repository](https://github.com/PierrunoYT/locale)
- [TranslateGemma Documentation](https://ollama.com/library/translategemma)
- [Ollama Documentation](https://docs.ollama.com)
- [Tauri Documentation](https://tauri.app)

---

**Need more help?** Open an issue on GitHub or check the README for additional information.
