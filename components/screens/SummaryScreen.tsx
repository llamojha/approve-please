import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { formatMeterValue } from '../../utils/helpers';
import { useTranslations } from '../../hooks/useTranslations';

const SummaryScreen = () => {
  const {
    state: { currentDay, counters, meters, prodIncidents, falsePositiveRecords },
    actions: { advanceToNextDay, restartGame }
  } = useGameState();
  const translations = useTranslations();
  const summaryText = translations.summary;
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;
  const incidentsText = translations.incidents;
  const bugKindLabels = translations.shared.bugKinds;
  const severityLabels = translations.shared.severity;

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <p className="muted">{summaryText.endOfDay}</p>
        <h1>{summaryText.heading(currentDay)}</h1>
        <div className={styles.summaryGrid}>
          <div>
            <small>{counterLabels.prsApproved}</small>
            <h2>{counters.prsApproved}</h2>
          </div>
          <div>
            <small>{counterLabels.prsRejected}</small>
            <h2>{counters.prsRejected}</h2>
          </div>
          <div>
            <small>{counterLabels.bugsToProd}</small>
            <h2>{counters.bugsToProd}</h2>
          </div>
          <div>
            <small>{counterLabels.truePositives}</small>
            <h2>{counters.truePositives}</h2>
          </div>
          <div>
            <small>{counterLabels.falsePositives}</small>
            <h2>{counters.falsePositives}</h2>
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
          <button type="button" className={styles.screenButton} onClick={advanceToNextDay}>
            {summaryText.continueButton(currentDay + 1)}
          </button>
          <button
            type="button"
            className={`${styles.screenButton} ${styles.screenButtonSecondary}`}
            onClick={restartGame}
          >
            {summaryText.restartButton}
          </button>
        </div>
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>{summaryText.deployedHeading}</h3>
            <p className="muted">{summaryText.deployedBody}</p>
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
            <h3>{summaryText.falseHeading}</h3>
            <p className="muted">{summaryText.falseBody}</p>
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

export default SummaryScreen;
