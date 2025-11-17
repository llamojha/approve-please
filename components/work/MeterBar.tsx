import styles from '../../styles/Desk.module.css';
import { formatMeterValue, meterColorFromValue } from '../../utils/helpers';
import { QUEUE_PRESSURE_CHEVRON_CAP } from '../../constants/game';

interface MeterBarProps {
  label: string;
  value: number;
  chevronCount?: number;
}

const MeterBar = ({ label, value, chevronCount }: MeterBarProps) => {
  const displayValue = formatMeterValue(value);
  const safeCount = Math.max(0, Math.min(QUEUE_PRESSURE_CHEVRON_CAP, chevronCount ?? 0));
  const chevrons = safeCount > 0 ? '<'.repeat(safeCount) : '';

  return (
    <div className={styles.meterBar}>
      <div className={styles.meterHeader}>
        <span>{label}</span>
        <div className={styles.meterHeaderRight}>
          {safeCount > 0 && (
            <span className={styles.meterTrend} aria-label={`${label} dropping`}>
              {chevrons}
            </span>
          )}
          <strong>{displayValue}%</strong>
        </div>
      </div>
      <div className={styles.meterTrack}>
        <span style={{ width: `${value}%`, background: meterColorFromValue(value) }} />
      </div>
    </div>
  );
};

export default MeterBar;
