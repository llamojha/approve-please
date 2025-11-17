import Link from 'next/link';
import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { formatMeterValue } from '../../utils/helpers';
import { Counters } from '../../types';

const GameOverScreen = () => {
  const {
    state: { currentDay, gameOverReason, counters, meters, history, prodIncidents, falsePositiveRecords },
    actions: { restartGame }
  } = useGameState();

  const aggregateCounters = history.reduce<Counters>(
    (totals, day) => ({
      bugsToProd: totals.bugsToProd + day.counters.bugsToProd,
      prsApproved: totals.prsApproved + day.counters.prsApproved,
      prsRejected: totals.prsRejected + day.counters.prsRejected,
      truePositives: totals.truePositives + day.counters.truePositives,
      falsePositives: totals.falsePositives + day.counters.falsePositives
    }),
    { bugsToProd: 0, prsApproved: 0, prsRejected: 0, truePositives: 0, falsePositives: 0 }
  );

  const finalCounters: Counters = {
    bugsToProd: aggregateCounters.bugsToProd + counters.bugsToProd,
    prsApproved: aggregateCounters.prsApproved + counters.prsApproved,
    prsRejected: aggregateCounters.prsRejected + counters.prsRejected,
    truePositives: aggregateCounters.truePositives + counters.truePositives,
    falsePositives: aggregateCounters.falsePositives + counters.falsePositives
  };

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <span className={styles.gameOverTag}>Game Over</span>
        <h1>Terminated on Day {currentDay}</h1>
        <p>{gameOverReason ?? 'Something terrible happened in prod.'}</p>
        <div className={styles.summaryGrid}>
          <div>
            <small>PRs Approved</small>
            <h2>{finalCounters.prsApproved}</h2>
          </div>
          <div>
            <small>PRs Rejected</small>
            <h2>{finalCounters.prsRejected}</h2>
          </div>
          <div>
            <small>Bugs to Prod</small>
            <h2>{finalCounters.bugsToProd}</h2>
          </div>
          <div>
            <small>True Positives</small>
            <h2>{finalCounters.truePositives}</h2>
          </div>
          <div>
            <small>False Positives</small>
            <h2>{finalCounters.falsePositives}</h2>
          </div>
        </div>
        <div className={styles.summaryGrid} style={{ marginTop: '2rem' }}>
          <div>
            <small>Stability</small>
            <h2>{formatMeterValue(meters.stability)}%</h2>
          </div>
          <div>
            <small>Velocity</small>
            <h2>{formatMeterValue(meters.velocity)}%</h2>
          </div>
          <div>
            <small>Satisfaction</small>
            <h2>{formatMeterValue(meters.satisfaction)}%</h2>
          </div>
        </div>
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={restartGame}>
            Restart Campaign
          </button>
          <Link className={`${styles.screenButton} ${styles.screenButtonSecondary}`} href="/">
            Back to Title
          </Link>
        </div>
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>Deployed Bugs</h3>
            <p className="muted">Final day incidents that melted prod.</p>
            <ul className={styles.incidentList}>
              {prodIncidents.map((incident, index) => (
                <li key={`${incident.prId}-${incident.bugKind}-${index}`} className={styles.incidentItem}>
                  <div className={styles.incidentMeta}>
                    <div>
                      <strong>{incident.title}</strong>
                      <div className={styles.incidentSubline}>by {incident.author} · {incident.bugKind} bug</div>
                    </div>
                    <span className={`${styles.badge} ${styles[`severity${incident.severity.charAt(0).toUpperCase()}${incident.severity.slice(1)}`]}`}>
                      {incident.severity}
                    </span>
                  </div>
                  {incident.description && <p className={styles.incidentNote}>{incident.description}</p>}
                  {incident.lines.length > 0 && (
                    <ul className={styles.lineList}>
                      {incident.lines.map((line) => (
                        <li key={`${incident.prId}-${line.lineNumber}`}>L{line.lineNumber}: <code>{line.content || '…'}</code></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {falsePositiveRecords.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>False Positives</h3>
            <p className="muted">Where you slowed velocity on the final day.</p>
            <ul className={styles.incidentList}>
              {falsePositiveRecords.map((record, index) => (
                <li key={`${record.prId}-${index}`} className={styles.incidentItem}>
                  <div className={styles.incidentMeta}>
                    <div>
                      <strong>{record.title}</strong>
                      <div className={styles.incidentSubline}>by {record.author}</div>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                      {record.claimedKind} suspicion
                    </span>
                  </div>
                  <p className={styles.incidentNote}>
                    You flagged a {record.claimedKind} issue. Actual bugs: {record.actualBugKinds.length > 0 ? record.actualBugKinds.join(', ') : 'none'}.
                  </p>
                  {record.selectedLines.length > 0 && (
                    <ul className={styles.lineList}>
                      {record.selectedLines.map((line) => (
                        <li key={`${record.prId}-fp-${line.lineNumber}`}>L{line.lineNumber}: <code>{line.content || '…'}</code></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
};

export default GameOverScreen;
