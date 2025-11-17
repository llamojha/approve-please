import styles from '../../styles/Desk.module.css';
import MeterBar from './MeterBar';
import Panel from '../common/Panel';
import { MeterSet, PullRequest } from '../../types';
import { calculateQueueChevronCount } from '../../utils/helpers';

interface MeterHudProps {
  meters: MeterSet;
  queue: PullRequest[];
}

const MeterHud = ({ meters, queue }: MeterHudProps) => {
  const chevrons = calculateQueueChevronCount(queue);

  return (
    <Panel>
      <div className={styles.meterHudGrid}>
        <MeterBar label="Stability" value={meters.stability} chevronCount={0} />
        <MeterBar label="Velocity" value={meters.velocity} chevronCount={chevrons} />
        <MeterBar label="Satisfaction" value={meters.satisfaction} chevronCount={chevrons} />
      </div>
    </Panel>
  );
};

export default MeterHud;
