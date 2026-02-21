import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LanguageSelect } from "./LanguageSelect";
import { LANGUAGES } from "./languages";
import "./App.css";

const MODEL_OPTIONS = [
  { value: "translategemma:4b", label: "TranslateGemma 4B" },
  { value: "translategemma:12b", label: "TranslateGemma 12B" },
  { value: "translategemma:27b", label: "TranslateGemma 27B" },
] as const;

const DEFAULT_MODEL = MODEL_OPTIONS[0].value;

const getModelLabel = (model: string) =>
  MODEL_OPTIONS.find((option) => option.value === model)?.label ?? model;

function App() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<
    "running" | "installed" | "disconnected" | null
  >(null);
  const [showInfo, setShowInfo] = useState(false);

  const selectedModelLabel = getModelLabel(selectedModel);

  const checkOllamaStatus = async (silent = false, model = selectedModel) => {
    try {
      const status = await invoke<string>("check_ollama_status", { model });
      if (status === "running") {
        setOllamaStatus("running");
      } else {
        setOllamaStatus("installed");
      }
      if (!silent) setError(null);
    } catch (err) {
      setOllamaStatus("disconnected");
      if (!silent) setError(err as string);
    }
  };

  useEffect(() => {
    setError(null);
    checkOllamaStatus(false, selectedModel);
    const interval = setInterval(() => checkOllamaStatus(true), 30_000);
    const onFocus = () => checkOllamaStatus(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [selectedModel]);

  useEffect(() => {
    try {
      localStorage.setItem("locale.selectedModel", selectedModel);
    } catch (e) {
      console.error("Failed to save model preference:", e);
    }
  }, [selectedModel]);

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
        model: selectedModel,
      });
      setTranslatedText(result);
      setOllamaStatus("running");
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
            title="Open help"
            aria-label="Open help"
          >
            <span aria-hidden="true">ℹ</span>
            <span>Help</span>
          </button>
        </div>
        <div className="status-indicator">
          {ollamaStatus === "running" && (
            <span className="status-badge connected">
              {selectedModelLabel} Running
            </span>
          )}
          {ollamaStatus === "installed" && (
            <span className="status-badge idle">
              {selectedModelLabel} Installed (Idle)
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
        <div className="model-selector">
          <label htmlFor="model-select">Model</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isTranslating}
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

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
                      ? `Translating with ${selectedModelLabel}...`
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
                <li><strong>TranslateGemma models</strong> – choose from:
                  <ul>
                    {MODEL_OPTIONS.map((model) => (
                      <li key={model.value}>
                        <strong>{model.label}</strong> – <code>ollama run {model.value}</code>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              <h3>Using Locale</h3>
              <ol>
                <li>Select a model from the <strong>Model</strong> dropdown</li>
                <li>Select source and target languages from the dropdowns (search by name or code)</li>
                <li>Enter text in the left panel</li>
                <li>Click <strong>Translate</strong></li>
                <li>Translation appears in the right panel</li>
              </ol>

              <h3>Connection Status</h3>
              <ul>
                <li><strong>Running</strong> (green): the selected model is loaded and ready</li>
                <li><strong>Installed (Idle)</strong> (amber): model is installed but not currently loaded</li>
                <li><strong>Ollama Disconnected</strong> (red): Ollama is not reachable</li>
              </ul>

              <h3>Quick Troubleshooting</h3>
              <ul>
                <li>Start Ollama: <code>ollama serve</code></li>
                <li>Install a model: <code>ollama run [model-name]</code></li>
                <li>See loaded models: <code>ollama ps</code></li>
                <li>See installed models: <code>ollama list</code></li>
              </ul>

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
