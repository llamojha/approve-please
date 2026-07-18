import styles from '../../styles/Desk.module.css';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { useTranslations } from '../../hooks/useTranslations';

const AccessibilityPanel = () => {
  const { theme, setTheme } = useUIPreferences();
  const isLight = theme === 'githob-light';
  const translations = useTranslations();
  const accessibilityText = translations.work.accessibility;

  return (
    <div className={`${styles.railCard} ${styles.themeCard}`}>
      <span className={styles.railEyebrow}>{accessibilityText.title.toUpperCase()}</span>
      <span className={styles.srOnly} aria-live="polite">
        {accessibilityText.label(isLight)}
      </span>
      <div className={styles.themeToggle} role="group" aria-label={accessibilityText.title}>
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
      </div>
    </div>
  );
};

export default AccessibilityPanel;
