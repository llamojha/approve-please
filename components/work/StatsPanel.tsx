import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { Counters } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

interface StatsPanelProps {
  counters: Counters;
}

const StatsPanel = ({ counters }: StatsPanelProps) => {
  const translations = useTranslations();
  const statsText = translations.work.stats;

  return (
    <Panel title={statsText.title}>
      <div className={styles.statsGrid}>
        <div className={styles.statsCard} title={statsText.tooltips.approved}>
          <small>{statsText.labels.approved}</small>
          <strong>{counters.prsApproved}</strong>
        </div>
        <div className={styles.statsCard} title={statsText.tooltips.rejected}>
          <small>{statsText.labels.rejected}</small>
          <strong>{counters.prsRejected}</strong>
        </div>
        <div className={`${styles.statsCard} ${styles.statsCardBugs}`} title={statsText.tooltips.bugsToProd}>
          <small>{statsText.labels.bugsToProd}</small>
          <strong>{counters.bugsToProd}</strong>
        </div>
        <div className={`${styles.statsCard} ${styles.statsCardTrue}`} title={statsText.tooltips.cleanApprovals}>
          <small>{statsText.labels.cleanApprovals}</small>
          <strong>{counters.cleanApprovals}</strong>
        </div>
        <div className={`${styles.statsCard} ${styles.statsCardTrue}`} title={statsText.tooltips.truePositives}>
          <small>{statsText.labels.truePositives}</small>
          <strong>{counters.truePositives}</strong>
        </div>
      </div>
    </Panel>
  );
};

export default StatsPanel;
