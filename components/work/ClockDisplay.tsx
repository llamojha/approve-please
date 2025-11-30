import { WORK_DAY_MINUTES } from '../../constants/game';
import { minutesToClock } from '../../utils/helpers';
import styles from '../../styles/Desk.module.css';
import { useTranslations } from '../../hooks/useTranslations';

interface ClockDisplayProps {
  currentTime: number;
  isTutorial?: boolean;
}

const ClockDisplay = ({ currentTime, isTutorial = false }: ClockDisplayProps) => {
  const progress = Math.min(currentTime / WORK_DAY_MINUTES, 1);
  const timeLabel = minutesToClock(currentTime);
  const { work } = useTranslations();
  const label = isTutorial ? work.clock.tutorialLabel : work.clock.label;
  const value = isTutorial ? work.clock.tutorialValue : timeLabel;

  return (
    <div className={[styles.clockCard, isTutorial ? styles.clockCardTutorial : ''].filter(Boolean).join(' ')}>
      <div>
        <p className={styles.clockLabel}>{label}</p>
        <p className={styles.clockValue}>{value}</p>
      </div>
      {isTutorial ? (
        <p className={styles.clockPausedCopy}>{work.clock.tutorialCopy}</p>
      ) : (
        <div className={styles.clockProgress}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
};

export default ClockDisplay;
