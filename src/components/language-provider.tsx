"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { translate, type Locale } from "@/lib/translations";

const LANGUAGE_KEY = "propertiespak:language";
const LANGUAGE_EVENT = "propertiespak:language-change";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getLocale(): Locale {
  try { return localStorage.getItem(LANGUAGE_KEY) === "ur" ? "ur" : "en"; } catch { return "en"; }
}

function subscribe(onChange: () => void) {
  window.addEventListener(LANGUAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LANGUAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getLocale, (): Locale => "en");
  const setLocale = useCallback((next: Locale) => {
    try { localStorage.setItem(LANGUAGE_KEY, next); } catch { /* language still changes for this page */ }
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }, []);
  const t = useCallback((text: string) => translate(text, locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
