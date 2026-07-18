import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { useTranslations } from '../../hooks/useTranslations';
import { formatFalsePositiveReason } from '../../utils/falsePositives';
import RunStatsCards from '../common/RunStatsCards';

const SummaryScreen = () => {
  const {
    state: { currentDay, counters, meters, prodIncidents, falsePositiveRecords },
    actions: { advanceToNextDay, restartGame }
  } = useGameState();
  const translations = useTranslations();
  const summaryText = translations.summary;
  const incidentsText = translations.incidents;
  const bugKindLabels = translations.shared.bugKinds;
  const severityLabels = translations.shared.severity;

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <span className={styles.eyebrow}>— {summaryText.endOfDay.toUpperCase()} · DAY {currentDay}</span>
        <h1>{summaryText.heading(currentDay)}</h1>
        <RunStatsCards counters={counters} meters={meters} />
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
            <p>{summaryText.deployedBody}</p>
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
                    <div className={styles.incidentBadges}>
                      <span className={`${styles.badge} ${styles.badgeReason}`}>
                        {bugKindLabels[incident.bugKind] ?? incident.bugKind}
                      </span>
                      <span
                        className={`${styles.badge} ${styles[`severity${incident.severity.charAt(0).toUpperCase()}${incident.severity.slice(
                          1
                        )}`]}`}
                      >
                        {severityLabels[incident.severity] ?? incident.severity}
                      </span>
                    </div>
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
            <p>{summaryText.falseBody}</p>
            <ul className={styles.incidentList}>
              {falsePositiveRecords.map((record, index) => {
                const reason = formatFalsePositiveReason(record.actualBugKinds, incidentsText, bugKindLabels);
                return (
                  <li key={`${record.prId}-${index}`} className={styles.incidentItem}>
                    <div className={styles.incidentMeta}>
                      <div>
                        <strong>{record.title}</strong>
                        <div className={styles.incidentSubline}>{incidentsText.authorOnly(record.author)}</div>
                      </div>
                      <div className={styles.incidentBadges}>
                        <span className={`${styles.badge} ${styles.badgeReason}`}>{reason.label}</span>
                      </div>
                    </div>
                    {reason.isClean && <p className={styles.incidentNote}>{incidentsText.rejectedWithoutCause}</p>}
                    {record.selectedLines.length > 0 && (
                      <ul className={styles.lineList}>
                        {record.selectedLines.map((line) => (
                          <li key={`${record.prId}-${line.lineNumber}`}>
                            L{line.lineNumber}: <code>{line.content || '…'}</code>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
};

export default SummaryScreen;
