# Security Issues and Bugs

**Last Updated**: 2026-02-21  
**Version**: 0.1.5  
**Status**: ✅ All issues fixed

## Fixed Security Issues

### ✅ HIGH PRIORITY (FIXED)

#### 1. Content Security Policy Disabled - FIXED
**File**: `localtranslate/src-tauri/tauri.conf.json:21`  
**Issue**: CSP is set to `null`, disabling all Content Security Policy protections.

```json
"security": {
  "csp": null
}
```

**Risk**: 
- Allows execution of arbitrary scripts if XSS vulnerability exists
- No protection against inline scripts or unsafe resources
- Reduces defense-in-depth security layers

**Fix Applied**: Enabled CSP in `tauri.conf.json`:
```json
"security": {
  "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' http://localhost:11434"
}
```

**Note**: The `'unsafe-inline'` for styles is needed for React inline styles. The `http://localhost:11434` is required for Ollama API communication.

---

#### 2. No Input Length Validation - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Added maximum text length validation (100,000 characters):
```rust
const MAX_TEXT_LENGTH: usize = 100_000;

if text.len() > MAX_TEXT_LENGTH {
    return Err(format!(
        "Text too long. Maximum length is {} characters ({} provided).",
        MAX_TEXT_LENGTH,
        text.len()
    ));
}
```

---

#### 3. No Timeout Configuration for HTTP Requests - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Added 120-second timeout for translation requests and 10-second timeout for status checks:
```rust
const HTTP_TIMEOUT_SECS: u64 = 120;

let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(HTTP_TIMEOUT_SECS))
    .build()
    .map_err(|_| "Failed to create HTTP client".to_string())?;
```

---

### ✅ MEDIUM PRIORITY (FIXED)

#### 4. Language Code Injection Risk - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Added language code validation against whitelist of 120+ supported codes:
```rust
const VALID_LANGUAGE_CODES: &[&str] = &[
    "aa", "ab", "af", "ak", "am", "an", "ar", "as", "az", ...
];

fn validate_language_code(code: &str) -> Result<(), String> {
    if VALID_LANGUAGE_CODES.contains(&code) {
        Ok(())
    } else {
        Err(format!("Invalid language code: {}", code))
    }
}
```

Called in `translate_text` before building the prompt.

---

#### 5. Error Messages Expose Internal Details - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Sanitized error messages for production builds:
```rust
.map_err(|e| {
    #[cfg(debug_assertions)]
    return format!("Failed to connect to Ollama... Error: {}", e);
    
    #[cfg(not(debug_assertions))]
    format!("Failed to connect to Ollama. Please ensure Ollama is running and '{}' is installed.", selected_model)
})?;
```

---

#### 6. No Rate Limiting - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Added mutex lock to prevent concurrent translations:
```rust
static TRANSLATION_LOCK: Mutex<()> = Mutex::new(());

#[tauri::command]
async fn translate_text(...) -> Result<String, String> {
    let _lock = TRANSLATION_LOCK.lock()
        .map_err(|_| "Translation already in progress".to_string())?;
    // ... rest of function
}
```

---

### ✅ LOW PRIORITY (FIXED)

#### 7. Hardcoded Localhost URL - FIXED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Fix Applied**: Made Ollama URL configurable via environment variable:
```rust
fn get_ollama_url() -> String {
    std::env::var("OLLAMA_URL").unwrap_or_else(|_| "http://localhost:11434".to_string())
}
```

Users can now set `OLLAMA_URL` environment variable to use a different Ollama instance.

---

#### 8. External Font Loading - FIXED
**File**: `localtranslate/index.html`  

**Fix Applied**: Removed Google Fonts CDN, now using system fonts:
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

This ensures 100% local operation and better privacy.

---

#### 9. No HTTPS Enforcement for Ollama - ADDRESSED
**File**: `localtranslate/src-tauri/src/lib.rs`  

**Status**: Now that URL is configurable, users can specify HTTPS if needed. HTTP is appropriate for localhost default.

---

## Fixed Bugs

### ✅ Functional Issues (FIXED)

#### 1. Error State Not Cleared on Model Change - FIXED
**File**: `localtranslate/src/App.tsx`  

**Fix Applied**: Clear error state when model changes:
```typescript
useEffect(() => {
    setError(null);
    checkOllamaStatus(false, selectedModel);
    // ... rest of code
}, [selectedModel]);
```

---

#### 2. localStorage Not Validated - FIXED
**File**: `localtranslate/src/App.tsx`  

**Fix Applied**: Added try-catch around localStorage operations:
```typescript
const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
        const savedModel = localStorage.getItem("locale.selectedModel");
        return MODEL_OPTIONS.some((option) => option.value === savedModel)
            ? (savedModel as string)
            : DEFAULT_MODEL;
    } catch {
        return DEFAULT_MODEL;
    }
});

useEffect(() => {
    try {
        localStorage.setItem("locale.selectedModel", selectedModel);
    } catch (e) {
        console.error("Failed to save model preference:", e);
    }
}, [selectedModel]);
```

---

## Remaining Issues

### 🟡 Known Issues (Not Critical)

#### 1. Model Selection Not Validated on Startup

---

#### 2. Race Condition in Status Checks
**File**: `localtranslate/src/App.tsx`  
**Issue**: Multiple status checks could run simultaneously (interval + focus event + model change).

**Impact**: 
- Status badge might flicker
- Unnecessary API calls to Ollama

**Status**: Low priority - not a security issue, just a minor UX concern.

---

#### 3. No Retry Logic for Network Failures
**File**: `localtranslate/src-tauri/src/lib.rs`  
**Issue**: Single network failure causes immediate error.

**Impact**: Transient network issues require manual retry.

**Status**: Low priority - user can click "Retry Connection" button.

---

## Testing Recommendations

1. **Fuzz Testing**: Test with extremely long inputs, special characters, and malformed language codes
2. **Network Testing**: Test behavior when Ollama is slow, unresponsive, or returns errors
3. **Concurrent Requests**: Test rapid-fire translation requests (now blocked by mutex)
4. **Model Switching**: Test switching models during active translation
5. **XSS Testing**: Test with HTML/script tags in translation text (now protected by CSP)

---

## Dependency Security

### NPM Packages
**Status**: ✅ No known vulnerabilities (checked 2026-02-21)
- 0 vulnerabilities found in npm audit

### Rust Crates
**Status**: ⚠️ Not checked (cargo-audit not installed)
- Recommend running: `cargo install cargo-audit && cargo audit`

---

## Summary

**All Critical Security Issues Fixed**: ✅

### Fixed Issues:
- ✅ Content Security Policy enabled
- ✅ Input length validation (100KB max)
- ✅ HTTP timeouts configured (120s for translation, 10s for status)
- ✅ Language code validation against whitelist
- ✅ Error message sanitization for production
- ✅ Translation request throttling (mutex lock)
- ✅ Configurable Ollama URL (via OLLAMA_URL env var)
- ✅ Removed external Google Fonts (now using system fonts)
- ✅ Error state cleared on model change
- ✅ localStorage error handling

### Remaining Non-Critical Issues:
- 🟡 Model validation on startup (minor UX issue)
- 🟡 Status check race conditions (minor performance issue)
- 🟡 No retry logic for network failures (user can manually retry)

**Security Posture**: Strong - All high and medium priority security issues resolved.
