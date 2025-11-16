import { useMemo } from 'react';
import { TRANSLATIONS, Locale } from '../constants/i18n';
import { useLocale } from '../context/LocaleContext';

export const useTranslations = () => {
  const { locale } = useLocale();
  return useMemo(() => TRANSLATIONS[locale], [locale]);
};

export const getTranslations = (locale: Locale) => TRANSLATIONS[locale];
