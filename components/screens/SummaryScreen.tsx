import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { formatMeterValue } from '../../utils/helpers';

const SummaryScreen = () => {
  const {
    state: { currentDay, counters, meters, prodIncidents, falsePositiveRecords },
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
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>Deployed Bugs</h3>
            <p className="muted">These PRs shipped issues. Study the culprit lines before tomorrow.</p>
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
            <p className="muted">Calls that slowed velocity. Compare your suspicion to what the PR actually contained.</p>
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

export default SummaryScreen;
