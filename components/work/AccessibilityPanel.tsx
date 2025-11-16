import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import TutorialHint from '../tutorial/TutorialHint';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { useTranslations } from '../../hooks/useTranslations';

const AccessibilityPanel = () => {
  const { theme, toggleTheme } = useUIPreferences();
  const isLight = theme === 'github-light';
  const translations = useTranslations();
  const accessibilityText = translations.work.accessibility;

  return (
    <Panel
      title={accessibilityText.title}
      titleHint={<TutorialHint text={accessibilityText.hint} />}
    >
      <div className={styles.accessibilityCard}>
        <div>
          <p className={styles.accessibilityLabel}>{accessibilityText.label(isLight)}</p>
          <p className={styles.accessibilityCopy}>{accessibilityText.copy}</p>
        </div>
        <button type="button" onClick={toggleTheme} className={styles.accessibilityToggle} aria-pressed={isLight}>
          {accessibilityText.button(isLight)}
          <span className={styles.toggleStatus} aria-live="polite">
            {accessibilityText.status(isLight)}
          </span>
        </button>
      </div>
      <p className={styles.accessibilityFootnote}>
        {accessibilityText.footnote}
      </p>
    </Panel>
  );
};

export default AccessibilityPanel;
