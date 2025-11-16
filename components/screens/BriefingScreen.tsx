import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';

const BriefingScreen = () => {
  const {
    state: { currentDay, activeConfig, rules, dayQuote },
    actions: { startWork }
  } = useGameState();

  const dayDescriptor = activeConfig.mood || activeConfig.codename || 'Operations';

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <h1>
          Day {currentDay} – {dayDescriptor}
        </h1>
        {activeConfig.briefing && <p className={styles.briefingBlurb}>{activeConfig.briefing}</p>}
        {dayQuote && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{dayQuote.text}&rdquo;</p>
            <footer>— {dayQuote.speaker}</footer>
          </blockquote>
        )}
        {rules.length > 0 && (
          <ol className={styles.rulesList}>
            {rules.map((rule) => (
              <li key={rule.id}>{rule.description}</li>
            ))}
          </ol>
        )}
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={startWork}>
            Start Day
          </button>
        </div>
      </section>
    </main>
  );
};

export default BriefingScreen;
