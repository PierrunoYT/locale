import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { LanguageSelect } from "./LanguageSelect";
import { LANGUAGES } from "./languages";
import "./App.css";

type Tab = "translate" | "grammar";
type ModelStatus = "running" | "installed" | "not_installed" | "disconnected" | null;

const MODEL_OPTIONS = [
  { value: "translategemma:4b", label: "TranslateGemma 4B" },
  { value: "translategemma:12b", label: "TranslateGemma 12B" },
  { value: "translategemma:27b", label: "TranslateGemma 27B" },
] as const;

const GRAMMAR_MODEL_OPTIONS = [
  { value: "gemma3:1b", label: "Gemma3 1B" },
  { value: "gemma3:4b", label: "Gemma3 4B" },
  { value: "gemma3:12b", label: "Gemma3 12B" },
  { value: "gemma3:27b", label: "Gemma3 27B" },
] as const;

const DEFAULT_MODEL = MODEL_OPTIONS[0].value;
const DEFAULT_GRAMMAR_MODEL = GRAMMAR_MODEL_OPTIONS[1].value;

const getModelLabel = (model: string) =>
  MODEL_OPTIONS.find((option) => option.value === model)?.label ??
  GRAMMAR_MODEL_OPTIONS.find((option) => option.value === model)?.label ??
  model;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("translate");

  // Translation state
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
  const [ollamaStatus, setOllamaStatus] = useState<ModelStatus>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Grammar state
  const [grammarInput, setGrammarInput] = useState("");
  const [grammarOutput, setGrammarOutput] = useState("");
  const [grammarLang, setGrammarLang] = useState("en");
  const [selectedGrammarModel, setSelectedGrammarModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("locale.selectedGrammarModel");
      return GRAMMAR_MODEL_OPTIONS.some((option) => option.value === saved)
        ? (saved as string)
        : DEFAULT_GRAMMAR_MODEL;
    } catch {
      return DEFAULT_GRAMMAR_MODEL;
    }
  });
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [grammarModelStatus, setGrammarModelStatus] = useState<ModelStatus>(null);

  // Pull/download state
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<{ status: string; percent: number | null } | null>(null);

  const selectedModelLabel = getModelLabel(selectedModel);
  const selectedGrammarModelLabel = getModelLabel(selectedGrammarModel);

  const checkOllamaStatus = async (silent = false, model = selectedModel) => {
    try {
      const status = await invoke<string>("check_ollama_status", { model });
      if (status === "running") {
        setOllamaStatus("running");
      } else {
        setOllamaStatus("installed");
      }
      setError(null);
    } catch (err) {
      const errorStr = err as string;
      if (errorStr.includes("not found")) {
        setOllamaStatus("not_installed");
      } else {
        setOllamaStatus("disconnected");
      }
      if (!silent) setError(errorStr);
    }
  };

  const checkGrammarModelStatus = async (silent = false, model = selectedGrammarModel) => {
    try {
      const status = await invoke<string>("check_grammar_model_status", { model });
      if (status === "running") {
        setGrammarModelStatus("running");
      } else {
        setGrammarModelStatus("installed");
      }
      setGrammarError(null);
    } catch (err) {
      const errorStr = err as string;
      if (errorStr.includes("not found")) {
        setGrammarModelStatus("not_installed");
      } else {
        setGrammarModelStatus("disconnected");
      }
      if (!silent) setGrammarError(errorStr);
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
    setGrammarError(null);
    checkGrammarModelStatus(false, selectedGrammarModel);
    const interval = setInterval(() => checkGrammarModelStatus(true), 30_000);
    return () => clearInterval(interval);
  }, [selectedGrammarModel]);

  useEffect(() => {
    try {
      localStorage.setItem("locale.selectedModel", selectedModel);
    } catch (e) {
      console.error("Failed to save model preference:", e);
    }
  }, [selectedModel]);

  useEffect(() => {
    try {
      localStorage.setItem("locale.selectedGrammarModel", selectedGrammarModel);
    } catch (e) {
      console.error("Failed to save grammar model preference:", e);
    }
  }, [selectedGrammarModel]);

  useEffect(() => {
    const unlisten = listen<{ status: string; total?: number; completed?: number }>(
      "pull-progress",
      (event) => {
        const { status, total, completed } = event.payload;
        const percent = total && completed ? (completed / total) * 100 : null;
        setPullProgress({ status, percent });
      }
    );
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handlePullModel = async (model: string) => {
    setPullingModel(model);
    setPullProgress({ status: "Starting download...", percent: null });
    setError(null);
    setGrammarError(null);

    try {
      await invoke("pull_model", { model });
      if (MODEL_OPTIONS.some((m) => m.value === model)) {
        await checkOllamaStatus(false, model);
      } else {
        await checkGrammarModelStatus(false, model);
      }
    } catch (err) {
      if (MODEL_OPTIONS.some((m) => m.value === model)) {
        setError(err as string);
      } else {
        setGrammarError(err as string);
      }
    } finally {
      setPullingModel(null);
      setPullProgress(null);
    }
  };

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

  const handleCorrectGrammar = async () => {
    if (!grammarInput.trim()) {
      setGrammarError("Please enter some text to correct");
      return;
    }

    setIsCorrecting(true);
    setGrammarError(null);
    setGrammarOutput("");

    try {
      const result = await invoke<string>("correct_grammar", {
        text: grammarInput,
        language: grammarLang,
        model: selectedGrammarModel,
      });
      setGrammarOutput(result);
      setGrammarModelStatus("running");
    } catch (err) {
      setGrammarError(err as string);
      setGrammarModelStatus("disconnected");
    } finally {
      setIsCorrecting(false);
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

  const currentStatus = activeTab === "translate" ? ollamaStatus : grammarModelStatus;
  const currentStatusLabel = activeTab === "translate"
    ? selectedModelLabel
    : selectedGrammarModelLabel;

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
          {currentStatus === "running" && (
            <span className="status-badge connected">
              {currentStatusLabel} Running
            </span>
          )}
          {currentStatus === "installed" && (
            <span className="status-badge idle">
              {currentStatusLabel} Installed (Idle)
            </span>
          )}
          {currentStatus === "not_installed" && (
            <span className="status-badge disconnected">
              {currentStatusLabel} Not Installed
            </span>
          )}
          {currentStatus === "disconnected" && (
            <span className="status-badge disconnected">
              Ollama Disconnected
            </span>
          )}
        </div>
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-button ${activeTab === "translate" ? "active" : ""}`}
          onClick={() => setActiveTab("translate")}
        >
          Translate
        </button>
        <button
          className={`tab-button ${activeTab === "grammar" ? "active" : ""}`}
          onClick={() => setActiveTab("grammar")}
        >
          Grammar
        </button>
      </nav>

      {activeTab === "translate" && (
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

          {ollamaStatus === "not_installed" && (
            <div className="download-section">
              {pullingModel === selectedModel ? (
                <>
                  <div className="pull-info">
                    <span className="pull-status">{pullProgress?.status || "Starting download..."}</span>
                    {pullProgress?.percent != null && (
                      <span className="pull-percent">{pullProgress.percent.toFixed(1)}%</span>
                    )}
                  </div>
                  <div className="pull-progress">
                    <div
                      className="pull-progress-bar"
                      style={{ width: `${pullProgress?.percent ?? 0}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="download-text">{selectedModelLabel} is not installed</span>
                  <button
                    onClick={() => handlePullModel(selectedModel)}
                    className="download-button"
                    disabled={pullingModel !== null}
                  >
                    Download {selectedModelLabel}
                  </button>
                </>
              )}
            </div>
          )}

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
      )}

      {activeTab === "grammar" && (
        <div className="translation-panel">
          <div className="model-selector">
            <label htmlFor="grammar-model-select">Model</label>
            <select
              id="grammar-model-select"
              value={selectedGrammarModel}
              onChange={(e) => setSelectedGrammarModel(e.target.value)}
              disabled={isCorrecting}
            >
              {GRAMMAR_MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {grammarModelStatus === "not_installed" && (
            <div className="download-section">
              {pullingModel === selectedGrammarModel ? (
                <>
                  <div className="pull-info">
                    <span className="pull-status">{pullProgress?.status || "Starting download..."}</span>
                    {pullProgress?.percent != null && (
                      <span className="pull-percent">{pullProgress.percent.toFixed(1)}%</span>
                    )}
                  </div>
                  <div className="pull-progress">
                    <div
                      className="pull-progress-bar"
                      style={{ width: `${pullProgress?.percent ?? 0}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="download-text">{selectedGrammarModelLabel} is not installed</span>
                  <button
                    onClick={() => handlePullModel(selectedGrammarModel)}
                    className="download-button"
                    disabled={pullingModel !== null}
                  >
                    Download {selectedGrammarModelLabel}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="grammar-lang-selector">
            <label>Language</label>
            <LanguageSelect
              value={grammarLang}
              onChange={(code) => setGrammarLang(code)}
              disabled={isCorrecting}
            />
          </div>

          {grammarError && (
            <div className="error-message">
              <strong>Error:</strong>
              <pre>{grammarError}</pre>
              {grammarModelStatus === "disconnected" && (
                <button
                  onClick={() => checkGrammarModelStatus()}
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
                <span className="text-area-label">Original</span>
                <div className="text-area-container">
                  <textarea
                    className="text-input"
                    placeholder="Enter text to check grammar..."
                    value={grammarInput}
                    onChange={(e) => setGrammarInput(e.target.value)}
                    disabled={isCorrecting}
                  />
                </div>
              </div>

              <div className="text-area-wrapper">
                <span className="text-area-label">Corrected</span>
                <div className="text-area-container">
                  <textarea
                    className="text-output"
                    placeholder="Corrected text will appear here..."
                    value={
                      isCorrecting
                        ? `Correcting with ${selectedGrammarModelLabel}...`
                        : grammarOutput
                    }
                    readOnly
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCorrectGrammar}
              className="translate-button"
              disabled={isCorrecting || !grammarInput.trim()}
            >
              {isCorrecting ? "Correcting..." : "Correct Grammar"}
            </button>
          </div>
        </div>
      )}

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

              <h3>Translation</h3>
              <ol>
                <li>Select a model from the <strong>Model</strong> dropdown</li>
                <li>Select source and target languages from the dropdowns (search by name or code)</li>
                <li>Enter text in the left panel</li>
                <li>Click <strong>Translate</strong></li>
                <li>Translation appears in the right panel</li>
              </ol>

              <h3>Grammar Correction</h3>
              <ol>
                <li>Switch to the <strong>Grammar</strong> tab</li>
                <li>Select the language of your text</li>
                <li>Enter text in the left panel</li>
                <li>Click <strong>Correct Grammar</strong></li>
                <li>Corrected text appears in the right panel</li>
              </ol>
              <p>Grammar correction uses <strong>Gemma3 4B</strong>. Install it with: <code>ollama run gemma3:4b</code></p>

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
