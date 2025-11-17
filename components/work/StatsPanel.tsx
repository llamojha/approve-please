import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { Counters } from '../../types';

interface StatsPanelProps {
  counters: Counters;
}

const StatsPanel = ({ counters }: StatsPanelProps) => {
  return (
    <Panel title="Metrics">
      <div className={styles.statsGrid}>
        <div title="PRs you merged today. These keep features flowing but risky ones can hurt stability.">
          <small>Approved</small>
          <strong>{counters.prsApproved}</strong>
        </div>
        <div title="PRs you rejected with requested changes. Slows things down but can prevent incidents.">
          <small>Rejected</small>
          <strong>{counters.prsRejected}</strong>
        </div>
        <div title="Bugs that escaped to production from approved PRs. Too many will tank stability.">
          <small>Bugs to Prod</small>
          <strong>{counters.bugsToProd}</strong>
        </div>
        <div title="Correct catches where you called out a real bug before it shipped.">
          <small>True Positives</small>
          <strong>{counters.truePositives}</strong>
        </div>
        <div title="False alarms where you flagged a bug that wasn’t there, costing time and goodwill.">
          <small>False Positives</small>
          <strong>{counters.falsePositives}</strong>
        </div>
      </div>
    </Panel>
  );
};

export default StatsPanel;
