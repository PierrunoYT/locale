import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LanguageSelect } from "./LanguageSelect";
import { LANGUAGES } from "./languages";
import "./App.css";

function App() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const checkOllamaStatus = async (silent = false) => {
    try {
      await invoke<string>("check_ollama_status");
      setOllamaStatus("connected");
      if (!silent) setError(null);
    } catch (err) {
      setOllamaStatus("disconnected");
      if (!silent) setError(err as string);
    }
  };

  // Check on mount, periodically (every 30s), and when window regains focus
  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(() => checkOllamaStatus(true), 30_000);
    const onFocus = () => checkOllamaStatus(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError("Please enter some text to translate");
      return;
    }

    if (sourceLang === targetLang) {
      setError("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTranslatedText("");

    try {
      const result = await invoke<string>("translate_text", {
        sourceLang,
        targetLang,
        text: sourceText,
      });
      setTranslatedText(result);
      setOllamaStatus("connected");
    } catch (err) {
      setError(err as string);
      setOllamaStatus("disconnected");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>Locale</h1>
          <button
            type="button"
            className="info-button"
            onClick={() => setShowInfo(true)}
            title="How it works"
            aria-label="How it works"
          >
            ℹ
          </button>
        </div>
        <div className="status-indicator">
          {ollamaStatus === "connected" && (
            <span className="status-badge connected">
              TranslateGemma 12B Connected
            </span>
          )}
          {ollamaStatus === "disconnected" && (
            <span className="status-badge disconnected">
              Ollama Disconnected
            </span>
          )}
        </div>
      </header>

      <div className="translation-panel">
        <div className="language-selector">
          <LanguageSelect
            value={sourceLang}
            onChange={(code) => setSourceLang(code)}
            disabled={isTranslating}
          />

          <button
            onClick={handleSwapLanguages}
            className="swap-button"
            title="Swap languages"
            disabled={isTranslating}
          >
            ⇄
          </button>

          <LanguageSelect
            value={targetLang}
            onChange={(code) => setTargetLang(code)}
            disabled={isTranslating}
          />
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong>
            <pre>{error}</pre>
            {ollamaStatus === "disconnected" && (
              <button
                onClick={() => checkOllamaStatus()}
                className="retry-button"
              >
                Retry Connection
              </button>
            )}
          </div>
        )}

        <div className="translation-section">
          <div className="translation-area">
            <div className="text-area-wrapper">
              <span className="text-area-label">
                {LANGUAGES.find((l) => l.code === sourceLang)?.name ?? sourceLang}
              </span>
              <div className="text-area-container">
                <textarea
                  className="text-input"
                  placeholder="Enter text to translate..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  disabled={isTranslating}
                />
              </div>
            </div>

            <div className="text-area-wrapper">
              <span className="text-area-label">
                {LANGUAGES.find((l) => l.code === targetLang)?.name ?? targetLang}
              </span>
              <div className="text-area-container">
                <textarea
                  className="text-output"
                  placeholder="Translation will appear here..."
                  value={
                    isTranslating
                      ? "Translating with TranslateGemma 12B..."
                      : translatedText
                  }
                  readOnly
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            className="translate-button"
            disabled={isTranslating || !sourceText.trim()}
          >
            {isTranslating ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="info-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal-header">
              <h2>How Locale Works</h2>
              <button
                type="button"
                className="info-close"
                onClick={() => setShowInfo(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="info-modal-body">
              <h3>Prerequisites</h3>
              <p>Locale runs translation entirely on your machine using:</p>
              <ul>
                <li><strong>Ollama</strong> – local AI runtime (install from ollama.com)</li>
                <li><strong>TranslateGemma 12B</strong> – run <code>ollama run translategemma:12b</code> to install</li>
              </ul>

              <h3>Using Locale</h3>
              <ol>
                <li>Select source and target languages from the dropdowns (search by name or code)</li>
                <li>Enter text in the left panel</li>
                <li>Click <strong>Translate</strong></li>
                <li>Translation appears in the right panel</li>
              </ol>

              <h3>Connection Status</h3>
              <p>The green badge means Ollama is running and TranslateGemma is ready. If it shows disconnected, start Ollama with <code>ollama serve</code> and ensure the model is installed.</p>

              <h3>Privacy</h3>
              <p>All translation happens locally. Your text never leaves your machine.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
