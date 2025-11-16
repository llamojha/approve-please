import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';

const SummaryScreen = () => {
  const {
    state: { currentDay, counters, meters },
    actions: { advanceToNextDay, restartGame }
  } = useGameState();

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <p className="muted">End of Day</p>
        <h1>Day {currentDay} Summary</h1>
        <div className={styles.summaryGrid}>
          <div>
            <small>PRs Approved</small>
            <h2>{counters.prsApproved}</h2>
          </div>
          <div>
            <small>PRs Rejected</small>
            <h2>{counters.prsRejected}</h2>
          </div>
          <div>
            <small>Bugs to Prod</small>
            <h2>{counters.bugsToProd}</h2>
          </div>
          <div>
            <small>True Positives</small>
            <h2>{counters.truePositives}</h2>
          </div>
          <div>
            <small>False Positives</small>
            <h2>{counters.falsePositives}</h2>
          </div>
        </div>
        <div className={styles.summaryGrid} style={{ marginTop: '2rem' }}>
          <div>
            <small>Stability</small>
            <h2>{meters.stability}%</h2>
          </div>
          <div>
            <small>Velocity</small>
            <h2>{meters.velocity}%</h2>
          </div>
          <div>
            <small>Satisfaction</small>
            <h2>{meters.satisfaction}%</h2>
          </div>
        </div>
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={advanceToNextDay}>
            Continue to Day {currentDay + 1}
          </button>
          <button
            type="button"
            className={`${styles.screenButton} ${styles.screenButtonSecondary}`}
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
      </section>
    </main>
  );
};

export default SummaryScreen;
