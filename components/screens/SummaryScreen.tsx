import { useRouter } from 'next/router';
import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { formatMeterValue, meterColorFromValue } from '../../utils/helpers';
import { useTranslations } from '../../hooks/useTranslations';
import { BugKind } from '../../types';

const SummaryScreen = () => {
  const {
    state: { currentDay, counters, meters, prodIncidents, falsePositiveRecords },
    actions: { advanceToNextDay, restartGame },
    mode
  } = useGameState();
  const router = useRouter();
  const translations = useTranslations();
  const summaryText = translations.summary;
  const tutorialSummary = translations.tutorial.summary;
  const isTutorial = mode === 'tutorial';
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;
  const incidentsText = translations.incidents;
  const bugKindLabels = translations.shared.bugKinds;
  const severityLabels = translations.shared.severity;
  const toAlpha = (color: string, alpha: number) => {
    if (color.startsWith('hsl')) {
      return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
    }
    return color;
  };
  const meterCardStyle = (value: number) => {
    const base = meterColorFromValue(value);
    return {
      background: `linear-gradient(135deg, ${toAlpha(base, 0.25)}, ${toAlpha(base, 0.1)})`,
      borderColor: base,
      color: '#fff'
    };
  };
  const stabilityCardStyle = meterCardStyle(meters.stability);
  const velocityCardStyle = meterCardStyle(meters.velocity);
  const satisfactionCardStyle = meterCardStyle(meters.satisfaction);
  const formatFalsePositiveReason = (actualBugKinds: BugKind[]) => {
    if (actualBugKinds.length === 0) {
      return { label: incidentsText.reasonClean, isClean: true };
    }
    const uniqueKinds = Array.from(new Set(actualBugKinds));
    if (uniqueKinds.length === 1) {
      const [onlyKind] = uniqueKinds;
      return { label: bugKindLabels[onlyKind] ?? onlyKind, isClean: false };
    }
    return { label: incidentsText.reasonMixed, isClean: false };
  };

  const summaryHeading = isTutorial ? tutorialSummary.heading : summaryText.heading(currentDay);
  const summaryTagline = isTutorial ? tutorialSummary.tagline : summaryText.endOfDay;

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <p className="muted">{summaryTagline}</p>
        <h1>{summaryHeading}</h1>
        {isTutorial && <p className={styles.tutorialSummaryIntro}>{tutorialSummary.body}</p>}
        <div className={`${styles.summaryGrid} ${styles.summaryGridWide}`}>
          <div className={`${styles.summaryCard} ${styles.summaryCardApproved}`}>
            <small>{counterLabels.prsApproved}</small>
            <h2>{counters.prsApproved}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardRejected}`}>
            <small>{counterLabels.prsRejected}</small>
            <h2>{counters.prsRejected}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
            <small>{counterLabels.cleanApprovals}</small>
            <h2>{counters.cleanApprovals}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardBugs}`}>
            <small>{counterLabels.bugsToProd}</small>
            <h2>{counters.bugsToProd}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardFalse}`}>
            <small>{counterLabels.falsePositives}</small>
            <h2>{counters.falsePositives}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
            <small>{counterLabels.truePositives}</small>
            <h2>{counters.truePositives}</h2>
          </div>
        </div>
        <div className={`${styles.summaryGrid} ${styles.summaryGridWide}`} style={{ marginTop: '2rem' }}>
          <div className={`${styles.summaryCard} ${styles.meterCard}`} style={stabilityCardStyle}>
            <small>{meterLabels.stability}</small>
            <h2>{formatMeterValue(meters.stability)}%</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.meterCard}`} style={velocityCardStyle}>
            <small>{meterLabels.velocity}</small>
            <h2>{formatMeterValue(meters.velocity)}%</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.meterCard}`} style={satisfactionCardStyle}>
            <small>{meterLabels.satisfaction}</small>
            <h2>{formatMeterValue(meters.satisfaction)}%</h2>
          </div>
        </div>
        <div className={styles.screenActions}>
          {isTutorial ? (
            <>
              <button type="button" className={styles.screenButton} onClick={() => router.push('/game')}>
                {tutorialSummary.startCta}
              </button>
              <button
                type="button"
                className={`${styles.screenButton} ${styles.screenButtonSecondary}`}
                onClick={restartGame}
              >
                {tutorialSummary.restartCta}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
            <p className="muted">{summaryText.falseBody}</p>
            <ul className={styles.incidentList}>
              {falsePositiveRecords.map((record, index) => {
                const reason = formatFalsePositiveReason(record.actualBugKinds);
                const reasonClassNames = [styles.badge, styles.badgeReason, reason.isClean ? styles.badgeReasonClean : null]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={`${record.prId}-${index}`} className={styles.incidentItem}>
                    <div className={styles.incidentMeta}>
                      <div>
                        <strong>{record.title}</strong>
                        <div className={styles.incidentSubline}>{incidentsText.authorOnly(record.author)}</div>
                      </div>
                      <div className={styles.incidentBadges}>
                        <span className={reasonClassNames}>{reason.label}</span>
                        <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                          {incidentsText.falseBadge(bugKindLabels[record.claimedKind] ?? record.claimedKind)}
                        </span>
                      </div>
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
