import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import TutorialHint from '../tutorial/TutorialHint';
import { useUIPreferences } from '../../context/UIPreferencesContext';

const AccessibilityPanel = () => {
  const { theme, toggleTheme } = useUIPreferences();
  const isLight = theme === 'github-light';

  return (
    <Panel
      title="Theme"
      titleHint={<TutorialHint text="Swap between GitHub Light and GitHub Dark palettes." />}
    >
      <div className={styles.accessibilityCard}>
        <div>
          <p className={styles.accessibilityLabel}>GitHub {isLight ? 'Light' : 'Dark'}</p>
          <p className={styles.accessibilityCopy}>Match the UI to the familiar GitHub aesthetic you prefer.</p>
        </div>
        <button type="button" onClick={toggleTheme} className={styles.accessibilityToggle} aria-pressed={isLight}>
          Switch to GitHub {isLight ? 'Dark' : 'Light'}
          <span className={styles.toggleStatus} aria-live="polite">
            {isLight ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
      <p className={styles.accessibilityFootnote}>
        Colors and spacing track GitHub&rsquo;s Primer tokens (canvas, borders, accent blues) for a native feel.
      </p>
    </Panel>
  );
};

export default AccessibilityPanel;
