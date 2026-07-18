import styles from '../../styles/Desk.module.css';
import { Counters } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

interface StatsPanelProps {
  counters: Counters;
}

const StatsPanel = ({ counters }: StatsPanelProps) => {
  const translations = useTranslations();
  const statsText = translations.work.stats;
  const labels = statsText.labels;

  const rows: { key: string; label: string; value: number; rowClass?: string; tooltip: string }[] = [
    { key: 'approved', label: labels.approved, value: counters.prsApproved, tooltip: statsText.tooltips.approved },
    { key: 'rejected', label: labels.rejected, value: counters.prsRejected, tooltip: statsText.tooltips.rejected },
    {
      key: 'clean',
      label: labels.cleanApprovals,
      value: counters.cleanApprovals,
      rowClass: styles.ledgerRowClean,
      tooltip: statsText.tooltips.cleanApprovals
    },
    {
      key: 'bugs',
      label: labels.bugsToProd,
      value: counters.bugsToProd,
      rowClass: styles.ledgerRowBugs,
      tooltip: statsText.tooltips.bugsToProd
    },
    {
      key: 'false',
      label: labels.falsePositives,
      value: counters.falsePositives,
      rowClass: styles.ledgerRowFalse,
      tooltip: statsText.tooltips.falsePositives
    },
    {
      key: 'true',
      label: labels.truePositives,
      value: counters.truePositives,
      rowClass: styles.ledgerRowTrue,
      tooltip: statsText.tooltips.truePositives
    }
  ];

  return (
    <div className={styles.railCard}>
      <span className={styles.railEyebrow}>{statsText.title.toUpperCase()}</span>
      <div className={styles.ledger}>
        {rows.map((row) => (
          <div
            key={row.key}
            className={[styles.ledgerRow, row.rowClass].filter(Boolean).join(' ')}
            title={row.tooltip}
          >
            <span className={styles.ledgerLabel}>{row.label.toUpperCase()}</span>
            <span className={styles.ledgerValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
