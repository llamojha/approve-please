import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';

const BriefingScreen = () => {
  const {
    state: { currentDay, currentMantra, dayQuote },
    actions: { startWork }
  } = useGameState();

  const dayDescriptor = currentMantra || 'Operations';

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <h1>
          Day {currentDay} – {dayDescriptor}
        </h1>
        {dayQuote && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{dayQuote.text}&rdquo;</p>
            <footer>— {dayQuote.speaker}</footer>
          </blockquote>
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
