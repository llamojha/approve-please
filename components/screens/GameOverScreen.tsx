import Link from 'next/link';
import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';

const GameOverScreen = () => {
  const {
    state: { currentDay, gameOverReason },
    actions: { restartGame }
  } = useGameState();

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <span className={styles.gameOverTag}>Game Over</span>
        <h1>Terminated on Day {currentDay}</h1>
        <p>{gameOverReason ?? 'Something terrible happened in prod.'}</p>
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={restartGame}>
            Restart Campaign
          </button>
          <Link className={`${styles.screenButton} ${styles.screenButtonSecondary}`} href="/">
            Back to Title
          </Link>
        </div>
      </section>
    </main>
  );
};

export default GameOverScreen;
