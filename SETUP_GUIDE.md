# Setup Guide

Quick setup for LocalTranslate with TranslateGemma 12B.

## Requirements

- 16GB+ RAM (or 8GB with 4B model)
- 10GB free disk space
- [Ollama](https://ollama.com/download) installed

## Installation

**1. Install Ollama**
```bash
# Download from: https://ollama.com/download
ollama --version  # verify
```

**2. Install TranslateGemma 12B**
```bash
ollama run translategemma:12b  # ~8GB download
```

**3. Install Dependencies**
```bash
cd localtranslate
npm install
```

**4. Run the App**
```bash
npm run tauri dev
```

Look for the green badge: **🟢 TranslateGemma 12B Connected**

## Troubleshooting

**"Ollama is not running"**
```bash
ollama serve
```
Then click "Retry Connection" in the app.

**"Model not found"**
```bash
ollama run translategemma:12b
```

**Out of memory?**
Use the 4B model (requires only 8GB RAM):
```bash
ollama run translategemma:4b
```
Then update `src-tauri/src/lib.rs` line 48 to use `translategemma:4b`

## Model Options

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| 4B | 3.3GB | 8GB | Fast | Good |
| 12B | 8.1GB | 16GB | Medium | Excellent ⭐ |
| 27B | 17GB | 32GB | Slow | Best |

To change models, edit `src-tauri/src/lib.rs` line 48:
```rust
model: "translategemma:4b".to_string(),  // or 12b, 27b
```
