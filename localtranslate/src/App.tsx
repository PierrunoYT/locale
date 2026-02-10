import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<string | null>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ];

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
        <h1>LocalTranslate</h1>
        <div className="status-indicator">
          {ollamaStatus === "connected" && (
            <span className="status-badge connected">
              🟢 TranslateGemma 12B Connected
            </span>
          )}
          {ollamaStatus === "disconnected" && (
            <span className="status-badge disconnected">
              🔴 Ollama Disconnected
            </span>
          )}
        </div>
      </header>

      <div className="translation-panel">
        <div className="language-selector">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="lang-select"
            disabled={isTranslating}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwapLanguages}
            className="swap-button"
            title="Swap languages"
            disabled={isTranslating}
          >
            ⇄
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="lang-select"
            disabled={isTranslating}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong>
            <pre>{error}</pre>
            {ollamaStatus === "disconnected" && (
              <button
                onClick={checkOllamaStatus}
                className="retry-button"
              >
                Retry Connection
              </button>
            )}
          </div>
        )}

        <div className="translation-area">
          <div className="text-area-container">
            <textarea
              className="text-input"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isTranslating}
            />
          </div>

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

        <button
          onClick={handleTranslate}
          className="translate-button"
          disabled={isTranslating || !sourceText.trim()}
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
      </div>
    </main>
  );
}

export default App;
