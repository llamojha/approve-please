import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'githob-dark' | 'githob-light';

interface UIPreferencesContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = 'approve-please.theme';

const normalizeStoredTheme = (value: string | null): ThemeMode => {
  if (value === 'githob-light' || value === 'light' || value === 'default') {
    return 'githob-light';
  }
  if (value === 'githob-dark' || value === 'high-contrast' || value === 'dark') {
    return 'githob-dark';
  }
  return 'githob-dark';
};

export const UIPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>('githob-dark');

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
    setTheme((prev) => (prev === 'githob-light' ? 'githob-dark' : 'githob-light'));
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
