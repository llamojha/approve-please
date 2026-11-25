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
  const hasLessons = prodIncidents.length > 0 || falsePositiveRecords.length > 0;

  return (
    <main className={styles.screenShell}>
      <section className={`${styles.screenCard} ${styles.summaryShell}`}>
        <p className={styles.eyebrow}>{summaryText.endOfDay}</p>
        <h1>{summaryText.heading(currentDay)}</h1>
        <p className={styles.screenLead}>{summaryText.intro}</p>
        <div className={styles.recapGrid}>
          <article className={`${styles.recapCard} ${styles.recapPositive}`}>
            <span aria-hidden="true">✓</span>
            <div><h2>{summaryText.wentWellHeading}</h2><p>{summaryText.wentWellBody(counters.cleanApprovals, counters.truePositives)}</p></div>
          </article>
          <article className={`${styles.recapCard} ${hasLessons ? styles.recapAttention : styles.recapPositive}`}>
            <span aria-hidden="true">{hasLessons ? '↳' : '✓'}</span>
            <div><h2>{hasLessons ? summaryText.learnHeading : summaryText.cleanHeading}</h2><p>{hasLessons ? summaryText.learnBody(counters.bugsToProd, counters.falsePositives) : summaryText.cleanBody}</p></div>
          </article>
        </div>
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>{summaryText.deployedHeading}</h3>
            <p className="muted">{summaryText.deployedBody}</p>
            <ul className={styles.incidentList}>
              {prodIncidents.map((incident, index) => (
                <li key={`${incident.prId}-${incident.bugKind}-${index}`} className={styles.incidentItem}>
                  <span className={styles.decisionLabel}>{summaryText.approvedUnsafe}</span>
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
                    <div className={styles.evidenceBlock}><strong>{summaryText.evidenceHeading}</strong><ul className={styles.lineList}>
                      {incident.lines.map((line) => (
                        <li key={`${incident.prId}-${line.filename ?? 'file'}-${line.rowId ?? line.lineNumber}`}>{line.filename ? `${line.filename}:` : 'L'}{line.lineNumber}: <code>{line.content || '…'}</code></li>
                      ))}
                    </ul></div>
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
              {falsePositiveRecords.map((record, index) => {
                const reason = formatFalsePositiveReason(record.actualBugKinds, incidentsText, bugKindLabels);
                return (
                  <li key={`${record.prId}-${index}`} className={styles.incidentItem}>
                    <span className={styles.decisionLabel}>{summaryText.rejectedSafe}</span>
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
                      <div className={styles.evidenceBlock}><strong>{summaryText.evidenceHeading}</strong><ul className={styles.lineList}>
                        {record.selectedLines.map((line) => (
                          <li key={`${record.prId}-${line.filename ?? 'file'}-${line.rowId ?? line.lineNumber}`}>
                            {line.filename ? `${line.filename}:` : 'L'}{line.lineNumber}: <code>{line.content || '…'}</code>
                          </li>
                        ))}
                      </ul></div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <div className={styles.summaryStats}><RunStatsCards counters={counters} meters={meters} /></div>
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={advanceToNextDay}>{summaryText.continueButton(currentDay + 1)}</button>
          <button type="button" className={`${styles.screenButton} ${styles.screenButtonSecondary}`} onClick={restartGame}>{summaryText.restartButton}</button>
        </div>
      </section>
    </main>
  );
};

export default SummaryScreen;
