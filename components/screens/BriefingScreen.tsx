import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';

const BriefingScreen = () => {
  const {
    state: { currentDay, activeConfig, rules, dayQuote },
    actions: { startWork }
  } = useGameState();

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <h1>
          Day {currentDay} – {activeConfig.codename}
        </h1>
        <div className={styles.briefingMood}>
          <small>Today's Mood</small>
          <span>{activeConfig.mood}</span>
        </div>
        {activeConfig.briefing && <p className={styles.briefingBlurb}>{activeConfig.briefing}</p>}
        {dayQuote && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{dayQuote.text}&rdquo;</p>
            <footer>— {dayQuote.speaker}</footer>
          </blockquote>
        )}
        {rules.length > 0 ? (
          <ol className={styles.rulesList}>
            {rules.map((rule) => (
              <li key={rule.id}>{rule.description}</li>
            ))}
          </ol>
        ) : (
          <p className={styles.rulesEmpty}>No special mandates today. Trust the mood.</p>
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
