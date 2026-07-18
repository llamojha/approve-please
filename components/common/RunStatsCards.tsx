import styles from '../../styles/Screen.module.css';
import { useTranslations } from '../../hooks/useTranslations';
import { formatMeterValue } from '../../utils/helpers';
import { Counters, MeterSet } from '../../types';

const meterFill = (value: number): string => {
  if (value < 34) {
    return 'var(--wk-danger)';
  }
  if (value < 67) {
    return 'var(--gold-500)';
  }
  return 'var(--teal-500)';
};

interface RunStatsCardsProps {
  counters: Counters;
  meters: MeterSet;
}

const RunStatsCards = ({ counters, meters }: RunStatsCardsProps) => {
  const translations = useTranslations();
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;

  const ledger: { key: string; label: string; value: number; tone?: string }[] = [
    { key: 'approved', label: counterLabels.prsApproved, value: counters.prsApproved },
    { key: 'rejected', label: counterLabels.prsRejected, value: counters.prsRejected },
    { key: 'clean', label: counterLabels.cleanApprovals, value: counters.cleanApprovals, tone: styles.ledgerClean },
    { key: 'bugs', label: counterLabels.bugsToProd, value: counters.bugsToProd, tone: styles.ledgerBugs },
    { key: 'false', label: counterLabels.falsePositives, value: counters.falsePositives },
    { key: 'true', label: counterLabels.truePositives, value: counters.truePositives, tone: styles.ledgerTrue }
  ];

  const meterItems = [
    { key: 'stability', label: meterLabels.stability, value: meters.stability },
    { key: 'velocity', label: meterLabels.velocity, value: meters.velocity },
    { key: 'satisfaction', label: meterLabels.satisfaction, value: meters.satisfaction }
  ];

  return (
    <>
      <div className={styles.ledger}>
        {ledger.map((cell) => (
          <div key={cell.key} className={[styles.ledgerCell, cell.tone].filter(Boolean).join(' ')}>
            <span className={styles.ledgerLabel}>{cell.label.toUpperCase()}</span>
            <div className={styles.ledgerValue}>{cell.value}</div>
          </div>
        ))}
      </div>
      <div className={styles.meterRow}>
        {meterItems.map((meter) => (
          <div key={meter.key}>
            <div className={styles.meterHead}>
              <span className={styles.meterLabel}>{meter.label.toUpperCase()}</span>
              <span className={styles.meterValue}>{formatMeterValue(meter.value)}%</span>
            </div>
            <div className={styles.meterTrack}>
              <span
                className={styles.meterFill}
                style={{ width: `${Math.max(0, Math.min(100, meter.value))}%`, background: meterFill(meter.value) }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RunStatsCards;
