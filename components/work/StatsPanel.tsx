import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import MeterBar from './MeterBar';
import { Counters, MeterSet, PullRequest } from '../../types';
import { calculateQueueChevronCount } from '../../utils/helpers';

interface StatsPanelProps {
  counters: Counters;
  meters: MeterSet;
  queue: PullRequest[];
}

const StatsPanel = ({ counters, meters, queue }: StatsPanelProps) => {
  const chevronCount = calculateQueueChevronCount(queue);

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
      <div className={styles.meterStack}>
        <MeterBar label="Stability" value={meters.stability} chevronCount={0} />
        <MeterBar label="Velocity" value={meters.velocity} chevronCount={chevronCount} />
        <MeterBar label="Satisfaction" value={meters.satisfaction} chevronCount={chevronCount} />
      </div>
    </Panel>
  );
};

export default StatsPanel;
