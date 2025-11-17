import Link from 'next/link';
import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { formatMeterValue } from '../../utils/helpers';
import { Counters } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

const GameOverScreen = () => {
  const {
    state: { currentDay, gameOverReason, counters, meters, history, prodIncidents, falsePositiveRecords },
    actions: { restartGame }
  } = useGameState();
  const translations = useTranslations();
  const gameOverText = translations.gameOver;
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;
  const incidentsText = translations.incidents;
  const bugKindLabels = translations.shared.bugKinds;
  const severityLabels = translations.shared.severity;

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

  const reasonCopy = gameOverReason ? translations.gameOverReasons[gameOverReason] : gameOverText.defaultReason;

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <span className={styles.gameOverTag}>{gameOverText.tag}</span>
        <h1>{gameOverText.heading(currentDay)}</h1>
        <p>{reasonCopy}</p>
        <div className={styles.summaryGrid}>
          <div>
            <small>{counterLabels.prsApproved}</small>
            <h2>{finalCounters.prsApproved}</h2>
          </div>
          <div>
            <small>{counterLabels.prsRejected}</small>
            <h2>{finalCounters.prsRejected}</h2>
          </div>
          <div>
            <small>{counterLabels.bugsToProd}</small>
            <h2>{finalCounters.bugsToProd}</h2>
          </div>
          <div>
            <small>{counterLabels.truePositives}</small>
            <h2>{finalCounters.truePositives}</h2>
          </div>
          <div>
            <small>{counterLabels.falsePositives}</small>
            <h2>{finalCounters.falsePositives}</h2>
          </div>
        </div>
        <div className={styles.summaryGrid} style={{ marginTop: '2rem' }}>
          <div>
            <small>{meterLabels.stability}</small>
            <h2>{formatMeterValue(meters.stability)}%</h2>
          </div>
          <div>
            <small>{meterLabels.velocity}</small>
            <h2>{formatMeterValue(meters.velocity)}%</h2>
          </div>
          <div>
            <small>{meterLabels.satisfaction}</small>
            <h2>{formatMeterValue(meters.satisfaction)}%</h2>
          </div>
        </div>
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={restartGame}>
            {gameOverText.restartButton}
          </button>
          <Link className={`${styles.screenButton} ${styles.screenButtonSecondary}`} href="/">
            {gameOverText.homeButton}
          </Link>
        </div>
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>{gameOverText.deployedHeading}</h3>
            <p className="muted">{gameOverText.deployedBody}</p>
            <ul className={styles.incidentList}>
              {prodIncidents.map((incident, index) => (
                <li key={`${incident.prId}-${incident.bugKind}-${index}`} className={styles.incidentItem}>
                  <div className={styles.incidentMeta}>
                    <div>
                      <strong>{incident.title}</strong>
                      <div className={styles.incidentSubline}>
                        {incidentsText.byline(incident.author, bugKindLabels[incident.bugKind] ?? incident.bugKind)}
                      </div>
                    </div>
                    <span className={`${styles.badge} ${styles[`severity${incident.severity.charAt(0).toUpperCase()}${incident.severity.slice(1)}`]}`}>
                      {severityLabels[incident.severity] ?? incident.severity}
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
            <h3>{gameOverText.falseHeading}</h3>
            <p className="muted">{gameOverText.falseBody}</p>
            <ul className={styles.incidentList}>
              {falsePositiveRecords.map((record, index) => (
                <li key={`${record.prId}-${index}`} className={styles.incidentItem}>
                  <div className={styles.incidentMeta}>
                    <div>
                      <strong>{record.title}</strong>
                      <div className={styles.incidentSubline}>{incidentsText.authorOnly(record.author)}</div>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                      {incidentsText.falseBadge(bugKindLabels[record.claimedKind] ?? record.claimedKind)}
                    </span>
                  </div>
                  <p className={styles.incidentNote}>
                    {incidentsText.falseNote(
                      bugKindLabels[record.claimedKind] ?? record.claimedKind,
                      record.actualBugKinds.length > 0
                        ? record.actualBugKinds
                            .map((kind) => bugKindLabels[kind] ?? kind)
                            .join(', ')
                        : incidentsText.none
                    )}
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
