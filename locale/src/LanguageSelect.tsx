import { useState, useRef, useEffect } from "react";
import { LANGUAGES } from "./languages";

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = LANGUAGES.find((l) => l.code === value);
  const filtered = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="language-select-wrapper" ref={containerRef}>
      <button
        type="button"
        className="language-select-trigger"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
      >
        <span>{selected?.name ?? value}</span>
        <span className="language-select-chevron">▼</span>
      </button>

      {isOpen && (
        <div className="language-select-dropdown">
          <div className="language-select-search">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsOpen(false);
              }}
              autoFocus
            />
          </div>
          <div className="language-select-list">
            {filtered.length === 0 ? (
              <div className="language-select-empty">No languages found</div>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-select-option ${lang.code === value ? "selected" : ""}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <span className="option-name">{lang.name}</span>
                  <span className="option-code">{lang.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
