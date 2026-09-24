"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

export default function LanguageSelector() {
  const { currentLang, languages, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLanguages = languages.filter((l) => l.active);
  const current = activeLanguages.find((l) => l.code === currentLang) || activeLanguages[0] || {
    code: "en",
    flag: "🇺🇸",
    nativeName: "English",
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          background: "var(--card-bg, rgba(255, 255, 255, 0.05))",
          border: "1px solid var(--card-border, rgba(255, 255, 255, 0.1))",
          padding: "6px 12px",
          borderRadius: "var(--radius-full, 9999px)",
          color: "var(--text-primary, #fff)",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ fontSize: "1.05rem", lineHeight: 1 }}>{current.flag}</span>
        <span className="lang-code-label" style={{ textTransform: "capitalize" }}>{current.nativeName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            opacity: 0.7,
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "170px",
            maxHeight: "320px",
            overflowY: "auto",
            background: "var(--card-bg-elevated, #16181f)",
            border: "1px solid var(--card-border, rgba(255, 255, 255, 0.12))",
            borderRadius: "14px",
            boxShadow: "0 18px 40px -10px rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(20px)",
            padding: "6px",
            zIndex: 1000,
            animation: "fadeInDown 0.15s ease",
          }}
        >
          <div
            style={{
              padding: "6px 10px 4px",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted, #71717a)",
              borderBottom: "1px solid var(--card-border, rgba(255, 255, 255, 0.08))",
              marginBottom: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Languages</span>
            <span>{activeLanguages.length} active</span>
          </div>

          {activeLanguages.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLang(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: isSelected ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))" : "transparent",
                  border: isSelected ? "1px solid rgba(236,72,153,0.3)" : "1px solid transparent",
                  color: isSelected ? "var(--text-primary, #fff)" : "var(--text-secondary, #a1a1aa)",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "var(--text-primary, #fff)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary, #a1a1aa)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && (
                  <span style={{ color: "#ec4899", fontSize: "0.85rem" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
