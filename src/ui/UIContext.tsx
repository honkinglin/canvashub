/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'zh' | 'en';
export type ThemeMode = 'light' | 'dark';

interface UIContextValue {
  language: Language;
  theme: ThemeMode;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

const LANGUAGE_KEY = 'canvashub-language';
const THEME_KEY = 'canvashub-theme';

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === 'zh' || saved === 'en') return saved;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
};

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo<UIContextValue>(
    () => ({
      language,
      theme,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh')),
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [language, theme]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
