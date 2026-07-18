import styles from '../../styles/Desk.module.css';
import { MeterSet } from '../../types';
import { WORK_DAY_MINUTES } from '../../constants/game';
import { minutesToClock, formatMeterValue, clamp } from '../../utils/helpers';
import { useTranslations } from '../../hooks/useTranslations';
import ThemeToggle from './ThemeToggle';

interface StatusStripProps {
  day: number;
  currentTime: number;
  meters: MeterSet;
}

// Same semantic scale as the end-of-day / game-over meters: low reads danger,
// mid reads gold, healthy reads teal.
const meterFill = (value: number): string => {
  if (value < 34) {
    return 'var(--wk-danger)';
  }
  if (value < 67) {
    return 'var(--gold-500)';
  }
  return 'var(--teal-500)';
};

interface StripMeterProps {
  label: string;
  short: string;
  value: number;
}

const StripMeter = ({ label, short, value }: StripMeterProps) => (
  <div className={styles.stripMeter} title={label}>
    <div className={styles.stripMeterHead}>
      <span className={styles.stripMeterLabel}>
        <span className={styles.stripMeterLabelFull}>{label}</span>
        <span className={styles.stripMeterLabelShort} aria-hidden="true">
          {short}
        </span>
      </span>
      <span className={styles.stripMeterValue}>{formatMeterValue(value)}</span>
    </div>
    <div className={styles.stripMeterTrack}>
      <span className={styles.stripMeterFill} style={{ width: `${clamp(value, 0, 100)}%`, background: meterFill(value) }} />
    </div>
  </div>
);

const StatusStrip = ({ day, currentTime, meters }: StatusStripProps) => {
  const translations = useTranslations();
  const meterLabels = translations.shared.meters;

  return (
    <header className={styles.statusStrip}>
      <div className={styles.stripLead}>
        <span className={styles.stripDay}>DAY {day}</span>
        <span className={styles.stripClock}>
          {minutesToClock(currentTime)} <span className={styles.stripClockEnd}>/ {minutesToClock(WORK_DAY_MINUTES)}</span>
        </span>
      </div>
      <div className={styles.stripMeters} role="group" aria-label="Session meters">
        <StripMeter label={meterLabels.stability} short="STB" value={meters.stability} />
        <StripMeter label={meterLabels.velocity} short="VEL" value={meters.velocity} />
        <StripMeter label={meterLabels.satisfaction} short="SAT" value={meters.satisfaction} />
      </div>
      {/* Ops rail (which holds the theme toggle) is hidden ≤1040px, so surface
          the toggle here for tablet/mobile. Hidden by CSS on wide screens. */}
      <div className={styles.stripTrail}>
        <div className={styles.stripTheme}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default StatusStrip;
