# Tasks – Locale

A record of the tasks completed to build this project.

## 1. Project Initialization

- [x] Scaffold a Tauri v2 + React + TypeScript + Vite project
- [x] Configure `vite.config.ts` for Tauri dev server (fixed port 1420, HMR, ignore `src-tauri`)
- [x] Set up TypeScript configs (`tsconfig.json`, `tsconfig.node.json`) with strict mode
- [x] Add root `.gitignore` for Node, Rust, editor, and OS artifacts
- [x] Add inner `.gitignore` for the app directory
- [x] Create initial `package.json` with dev/build/tauri scripts
- [x] Create `Cargo.toml` with Tauri, serde, reqwest, and tokio dependencies
- [x] Configure `tauri.conf.json` (product name, window size, CSP, bundle targets)
- [x] Set up Tauri capabilities (`default.json` with `core:default`, `opener:default`)
- [x] Add `build.rs` for Tauri build hooks
- [x] Create React entry point (`main.tsx` with StrictMode)

## 2. Rust Backend – Ollama Integration

- [x] Implement `translate_text` Tauri command that sends text to Ollama's `/api/chat` endpoint
- [x] Build the TranslateGemma prompt template (`build_translation_prompt`) for professional translation output
- [x] Implement `check_ollama_status` Tauri command checking `/api/tags` and `/api/ps` endpoints
- [x] Add three-state status detection: model running, model installed (idle), Ollama disconnected
- [x] Create full language-code-to-name mapping (`get_language_name`) for 120+ languages
- [x] Add language code whitelist validation (`VALID_LANGUAGE_CODES`)
- [x] Add model resolution and validation against supported models list (4B, 12B, 27B)
- [x] Support configurable Ollama URL via `OLLAMA_URL` environment variable
- [x] Add request throttling with `tokio::sync::Mutex` to prevent concurrent translations
- [x] Set HTTP timeouts (120s for translations, 10s for status checks)
- [x] Add input validation: max 100KB text length, empty text check
- [x] Sanitize error messages in production builds (`#[cfg(debug_assertions)]`)
- [x] Register both commands in Tauri's invoke handler

## 3. React Frontend – Main Application UI

- [x] Build `App.tsx` main component with source/target text areas and translate button
- [x] Add model selector dropdown (TranslateGemma 4B / 12B / 27B)
- [x] Persist selected model in `localStorage` and restore on launch
- [x] Implement language swap button (⇄) that swaps languages and text simultaneously
- [x] Display connection status badge in header (green/amber/red with labels)
- [x] Add periodic status polling (every 30s) and re-check on window focus
- [x] Clear error state when switching models
- [x] Show translating state with model name in output area
- [x] Disable inputs during translation
- [x] Validate source ≠ target language before translating
- [x] Display error messages with retry connection button when disconnected

## 4. Searchable Language Selector Component

- [x] Create `LanguageSelect.tsx` custom dropdown component
- [x] Implement search/filter by language name or ISO code
- [x] Add click-outside-to-close behavior
- [x] Show selected language name on trigger button
- [x] Auto-focus search input on dropdown open
- [x] Reset search text when dropdown opens
- [x] Handle Escape key to close dropdown
- [x] Display language name and code for each option

## 5. Language Data

- [x] Create `languages.ts` with 120+ language entries (code + name)
- [x] Include all TranslateGemma supported languages (ISO 639-1 codes)
- [x] Support Chinese variants (`zh`, `zh-Hans`, `zh-Hant`)

## 6. Styling & Design

- [x] Build dark-first UI with CSS custom properties (emerald accent palette)
- [x] Add light mode support via `prefers-color-scheme: light` media query
- [x] Style status badges with animated pulse for "running" state
- [x] Design help modal overlay with header, scrollable body, and close button
- [x] Style error messages with red tones and retry button
- [x] Style custom language select dropdown with search input and option list
- [x] Make translation area a two-column grid with resizable text areas (min-height 360px)
- [x] Add responsive layout for mobile (single-column below 768px)
- [x] Use system fonts only (no external font dependencies)
- [x] Add hover/active/disabled states for all interactive elements
- [x] Center translate button with max-width constraint

## 7. In-App Help System

- [x] Add help button (ℹ) in the header
- [x] Build help modal with prerequisites, usage guide, status explanation, and troubleshooting
- [x] Dynamically list available models from `MODEL_OPTIONS`
- [x] Show `ollama run` commands for each model
- [x] Include privacy statement

## 8. Security Hardening

- [x] Configure Content Security Policy in `tauri.conf.json` (restrict `connect-src` to localhost:11434)
- [x] Add input length validation (100KB max)
- [x] Add language code whitelist validation on the backend
- [x] Add model name validation against allowed list
- [x] Set HTTP request timeouts
- [x] Add async mutex to serialize translation requests
- [x] Sanitize error messages in release builds

## 9. App Branding & Icons

- [x] Create custom app icon set (32x32, 128x128, 128x128@2x, .icns, .ico)
- [x] Configure icon paths in `tauri.conf.json` bundle settings
- [x] Set window title to "Locale"
- [x] Set HTML page title to "Locale"
- [x] Design and create Locale logo SVG with green (#3bb172) brand color
- [x] Generate all platform icons using Tauri's built-in icon generator
- [x] Add logo to app header with 32px size
- [x] Update favicon to use Locale logo
- [x] Generate Windows Store logos (all sizes)
- [x] Generate Android icons (all mipmap densities with adaptive icon support)
- [x] Generate iOS icons (all required sizes from 20x20 to 1024x1024)

## 10. Project Rename (LocalTranslate → Locale)

- [x] Rename project directory from `localtranslate` to `locale`
- [x] Update `package.json` name to `locale`
- [x] Update `Cargo.toml` package name and description
- [x] Update `tauri.conf.json` product name and identifier
- [x] Update all documentation references
- [x] Update release script paths

## 11. Grammar Correction Tab

- [x] Add tab navigation (Translate / Grammar) with active state styling
- [x] Implement `correct_grammar` Tauri command using Gemma3 via Ollama `/api/chat`
- [x] Build grammar correction prompt template (`build_grammar_prompt`)
- [x] Add `check_grammar_model_status` Tauri command with model parameter
- [x] Add `resolve_grammar_model` validation for supported Gemma3 models (1B/4B/12B/27B)
- [x] Add grammar model selector dropdown (Gemma3 1B / 4B / 12B / 27B)
- [x] Persist selected grammar model in `localStorage` and restore on launch
- [x] Add three-state status badge for grammar model (Running/Installed Idle/Disconnected)
- [x] Add periodic grammar model status polling (every 30s), re-check on model change
- [x] Build grammar tab UI with language selector, input/output text areas, and "Correct Grammar" button
- [x] Show correcting state with model name in output area
- [x] Display grammar errors with retry connection button
- [x] Update header status badge to reflect active tab's model status
- [x] Update help modal with grammar correction instructions
- [x] Add tab bar and grammar selector CSS styles
- [x] Fix stale error on status recovery: silent polls now clear errors on success (both tabs)

## 12. Documentation

- [x] Write `README.md` with features, installation guide, project structure, and architecture
- [x] Expand README project structure to show full repository layout (root, frontend, and backend)
- [x] Write `CHANGELOG.md` following Keep a Changelog format
- [x] Write `RELEASE_v0.1.0.md` release notes
- [x] Add `LICENSE` file
- [x] Add app screenshot to `assets/`

## 13. In-App Model Download

- [x] Add `pull_model` Tauri command that streams Ollama's `/api/pull` endpoint
- [x] Emit `pull-progress` events with status, total, and completed bytes to the frontend
- [x] Validate requested model against both translation and grammar supported model lists
- [x] Add `PullProgress` and `OllamaPullLine` structs for streaming JSON deserialization
- [x] Register `pull_model` in Tauri invoke handler
- [x] Add `"not_installed"` status to differentiate "model missing" from "Ollama disconnected"
- [x] Update `checkOllamaStatus` and `checkGrammarModelStatus` to detect "not found" errors
- [x] Add `pullingModel` and `pullProgress` state for tracking downloads
- [x] Listen for `pull-progress` Tauri events and compute download percentage
- [x] Add `handlePullModel` function that invokes `pull_model` and re-checks status on completion
- [x] Add download section UI with "Download Model" button on both Translate and Grammar tabs
- [x] Show progress bar with status text and percentage during download
- [x] Add "Not Installed" status badge in header
- [x] Add CSS styles for download section, button, progress bar, and status text
- [x] Import `listen` from `@tauri-apps/api/event` and `Emitter` from `tauri` crate

## 14. Documentation – Screenshots

- [x] Add model download screenshot (`assets/model-download.png`) showing the in-app download prompt
- [x] Add grammar tab screenshot (`assets/grammar-tab.png`) showing the grammar correction interface
- [x] Rename raw screenshot files to descriptive names
- [x] Add both screenshots to `README.md` below the main app screenshot

## 15. Build & Release Tooling

- [x] Create `create-release.ps1` PowerShell script for automated GitHub releases
- [x] Support `--DryRun` and `--SkipBuild` flags in release script
- [x] Auto-detect version from `package.json` if not provided
- [x] Clean old build artifacts before building
- [x] Auto-discover platform installers (MSI, NSIS exe, DMG, AppImage, deb)
- [x] Create git tags and push to remote
- [x] Create GitHub release via `gh` CLI with installer attachments
- [x] Add release/tooling scripts to `.gitignore`
- [x] Consolidate version history into single v0.1.0 release
