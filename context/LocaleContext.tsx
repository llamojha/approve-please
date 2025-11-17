import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../constants/i18n';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const STORAGE_KEY = 'approve-please.locale';

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const isLocale = (value: string | null): value is Locale => {
  return value === 'en' || value === 'es';
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const updateLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale: updateLocale
    }),
    [locale, updateLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export { LocaleContext };
