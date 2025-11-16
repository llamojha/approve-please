import { WORK_DAY_MINUTES } from '../../constants/game';
import { minutesToClock } from '../../utils/helpers';
import styles from '../../styles/Desk.module.css';

interface ClockDisplayProps {
  currentTime: number;
}

const ClockDisplay = ({ currentTime }: ClockDisplayProps) => {
  const progress = Math.min(currentTime / WORK_DAY_MINUTES, 1);
  const timeLabel = minutesToClock(currentTime);

  return (
    <div className={styles.clockCard}>
      <div>
        <p className={styles.clockLabel}>Current Time</p>
        <p className={styles.clockValue}>{timeLabel}</p>
      </div>
      <div className={styles.clockProgress}>
        <span style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
};

export default ClockDisplay;
