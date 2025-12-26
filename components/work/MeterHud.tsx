import styles from '../../styles/Desk.module.css';
import MeterBar from './MeterBar';
import Panel from '../common/Panel';
import { MeterSet, PullRequest } from '../../types';
import { calculateQueueChevronCount } from '../../utils/helpers';
import { useTranslations } from '../../hooks/useTranslations';
import { useGameState } from '../../context/GameContext';

interface MeterHudProps {
  meters: MeterSet;
  queue: PullRequest[];
}

const MeterHud = ({ meters, queue }: MeterHudProps) => {
  const {
    state: { difficulty }
  } = useGameState();
  const chevrons = difficulty === 'learning' ? 0 : calculateQueueChevronCount(queue);
  const translations = useTranslations();
  const meterLabels = translations.shared.meters;

  return (
    <Panel>
      <div className={styles.meterHudGrid}>
        <MeterBar label={meterLabels.stability} value={meters.stability} chevronCount={0} />
        <MeterBar label={meterLabels.velocity} value={meters.velocity} chevronCount={chevrons} />
        <MeterBar label={meterLabels.satisfaction} value={meters.satisfaction} chevronCount={chevrons} />
      </div>
    </Panel>
  );
};

export default MeterHud;
