import styles from '../../styles/Desk.module.css';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { useTranslations } from '../../hooks/useTranslations';
import ThemeToggle from './ThemeToggle';

const AccessibilityPanel = () => {
  const { theme } = useUIPreferences();
  const isLight = theme === 'githob-light';
  const translations = useTranslations();
  const accessibilityText = translations.work.accessibility;

  return (
    <div className={`${styles.railCard} ${styles.themeCard}`}>
      <span className={styles.railEyebrow}>{accessibilityText.title.toUpperCase()}</span>
      <span className={styles.srOnly} aria-live="polite">
        {accessibilityText.label(isLight)}
      </span>
      <ThemeToggle />
    </div>
  );
};

export default AccessibilityPanel;
