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
        <h1>Day {currentDay} – {activeConfig.codename}</h1>
        {dayQuote && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{dayQuote.text}&rdquo;</p>
            <footer>— {dayQuote.speaker}</footer>
          </blockquote>
        )}
        <ol className={styles.rulesList}>
          {rules.map((rule) => (
            <li key={rule.id}>{rule.description}</li>
          ))}
        </ol>
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
