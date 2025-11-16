import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import MeterBar from './MeterBar';
import { Counters, MeterSet } from '../../types';

interface StatsPanelProps {
  counters: Counters;
  meters: MeterSet;
}

const StatsPanel = ({ counters, meters }: StatsPanelProps) => {
  return (
    <Panel title="Metrics">
      <div className={styles.statsGrid}>
        <div>
          <small>Approved</small>
          <strong>{counters.prsApproved}</strong>
        </div>
        <div>
          <small>Rejected</small>
          <strong>{counters.prsRejected}</strong>
        </div>
        <div>
          <small>Bugs to Prod</small>
          <strong>{counters.bugsToProd}</strong>
        </div>
        <div>
          <small>True Positives</small>
          <strong>{counters.truePositives}</strong>
        </div>
        <div>
          <small>False Positives</small>
          <strong>{counters.falsePositives}</strong>
        </div>
      </div>
      <div className={styles.meterStack}>
        <MeterBar label="Stability" value={meters.stability} />
        <MeterBar label="Velocity" value={meters.velocity} />
        <MeterBar label="Satisfaction" value={meters.satisfaction} />
      </div>
    </Panel>
  );
};

export default StatsPanel;
