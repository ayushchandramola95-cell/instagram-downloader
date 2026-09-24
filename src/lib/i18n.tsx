"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import initialData from "@/data/translations.json";

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
  active: boolean;
}

interface I18nContextType {
  currentLang: string;
  languages: LanguageMeta[];
  setLang: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  reloadTranslations: () => Promise<void>;
}

const I18nContext = createContext<I18nContextType>({
  currentLang: "en",
  languages: initialData.languages as LanguageMeta[],
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isRTL: false,
  reloadTranslations: async () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLangState] = useState<string>("en");
  const [languages, setLanguages] = useState<LanguageMeta[]>(initialData.languages as LanguageMeta[]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(
    initialData.strings as Record<string, Record<string, string>>
  );

  // Sync translations from API on mount
  const reloadTranslations = async () => {
    try {
      const res = await fetch("/api/translations");
      if (res.ok) {
        const data = await res.json();
        if (data.languages && data.strings) {
          setLanguages(data.languages);
          setTranslations(data.strings);
        }
      }
    } catch {
      // Fallback to local bundled data
    }
  };

  useEffect(() => {
    // Detect preferred or saved language
    const saved = localStorage.getItem("gramsave_lang");
    if (saved && initialData.strings[saved as keyof typeof initialData.strings]) {
      setCurrentLangState(saved);
    } else {
      // Check browser navigator language
      const browserLang = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2).toLowerCase() : "en";
      const match = (initialData.languages as LanguageMeta[]).find((l) => l.code === browserLang && l.active);
      if (match) {
        setCurrentLangState(match.code);
      }
    }

    reloadTranslations();

    // Record page visit in analytics
    try {
      const referrer = typeof document !== "undefined" ? document.referrer : "";
      let source = "direct";
      if (referrer.includes("google")) source = "google";
      else if (referrer.includes("bing")) source = "bing";
      else if (referrer.includes("instagram.com")) source = "instagram";
      else if (window.location.search.includes("src=bookmarklet") || window.location.search.includes("bookmarklet")) source = "bookmarklet";

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "visit", source }),
      }).catch(() => {});
    } catch {}
  }, []);

  const setLang = (code: string) => {
    setCurrentLangState(code);
    try {
      localStorage.setItem("gramsave_lang", code);
    } catch {}

    const selectedMeta = languages.find((l) => l.code === code);
    if (typeof document !== "undefined") {
      document.documentElement.lang = code;
      document.documentElement.dir = selectedMeta?.dir || "ltr";
    }
  };

  const currentMeta = languages.find((l) => l.code === currentLang);
  const isRTL = currentMeta?.dir === "rtl";

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[currentLang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    const enDict = translations["en"];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <I18nContext.Provider value={{ currentLang, languages, setLang, t, isRTL, reloadTranslations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
