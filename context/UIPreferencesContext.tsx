import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'github-dark' | 'github-light';

interface UIPreferencesContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = 'approve-please.theme';

const normalizeStoredTheme = (value: string | null): ThemeMode => {
  if (value === 'github-light' || value === 'light' || value === 'default') {
    return 'github-light';
  }
  if (value === 'github-dark' || value === 'high-contrast' || value === 'dark') {
    return 'github-dark';
  }
  return 'github-dark';
};

export const UIPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>('github-dark');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTheme(normalizeStoredTheme(stored));
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'github-light' ? 'github-dark' : 'github-light'));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme
    }),
    [theme]
  );

  return <UIPreferencesContext.Provider value={value}>{children}</UIPreferencesContext.Provider>;
};

export const useUIPreferences = () => {
  const context = useContext(UIPreferencesContext);
  if (!context) {
    throw new Error('useUIPreferences must be used within a UIPreferencesProvider');
  }
  return context;
};
