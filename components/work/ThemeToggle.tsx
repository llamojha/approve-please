import styles from '../../styles/Desk.module.css';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { useTranslations } from '../../hooks/useTranslations';

const ThemeToggle = () => {
  const { theme, setTheme } = useUIPreferences();
  const isLight = theme === 'githob-light';
  const translations = useTranslations();
  const label = translations.work.accessibility.title;

  return (
    <span className={styles.themeToggle} role="group" aria-label={label}>
      <button
        type="button"
        className={`${styles.themeSeg} ${!isLight ? styles.themeSegActive : ''}`}
        onClick={() => setTheme('githob-dark')}
        aria-pressed={!isLight}
      >
        DARK
      </button>
      <button
        type="button"
        className={`${styles.themeSeg} ${isLight ? styles.themeSegActive : ''}`}
        onClick={() => setTheme('githob-light')}
        aria-pressed={isLight}
      >
        LIGHT
      </button>
    </span>
  );
};

export default ThemeToggle;
