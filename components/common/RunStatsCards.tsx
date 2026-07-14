import styles from '../../styles/Screen.module.css';
import { useTranslations } from '../../hooks/useTranslations';
import { formatMeterValue, meterColorFromValue } from '../../utils/helpers';
import { Counters, MeterSet } from '../../types';

const toAlpha = (color: string, alpha: number) => {
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  }
  return color;
};

const meterCardStyle = (value: number) => {
  const base = meterColorFromValue(value);
  return {
    background: `linear-gradient(135deg, ${toAlpha(base, 0.25)}, ${toAlpha(base, 0.1)})`,
    borderColor: base,
    color: '#fff'
  };
};

interface RunStatsCardsProps {
  counters: Counters;
  meters: MeterSet;
}

const RunStatsCards = ({ counters, meters }: RunStatsCardsProps) => {
  const translations = useTranslations();
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;

  const stabilityCardStyle = meterCardStyle(meters.stability);
  const velocityCardStyle = meterCardStyle(meters.velocity);
  const satisfactionCardStyle = meterCardStyle(meters.satisfaction);

  return (
    <>
      <div className={`${styles.summaryGrid} ${styles.summaryGridWide}`}>
        <div className={`${styles.summaryCard} ${styles.summaryCardApproved}`}>
          <small>{counterLabels.prsApproved}</small>
          <h2>{counters.prsApproved}</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardRejected}`}>
          <small>{counterLabels.prsRejected}</small>
          <h2>{counters.prsRejected}</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
          <small>{counterLabels.cleanApprovals}</small>
          <h2>{counters.cleanApprovals}</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardBugs}`}>
          <small>{counterLabels.bugsToProd}</small>
          <h2>{counters.bugsToProd}</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
          <small>{counterLabels.truePositives}</small>
          <h2>{counters.truePositives}</h2>
        </div>
      </div>
      <div className={`${styles.summaryGrid} ${styles.summaryGridWide} ${styles.summaryGridSpaced}`}>
        <div className={`${styles.summaryCard} ${styles.meterCard}`} style={stabilityCardStyle}>
          <small>{meterLabels.stability}</small>
          <h2>{formatMeterValue(meters.stability)}%</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.meterCard}`} style={velocityCardStyle}>
          <small>{meterLabels.velocity}</small>
          <h2>{formatMeterValue(meters.velocity)}%</h2>
        </div>
        <div className={`${styles.summaryCard} ${styles.meterCard}`} style={satisfactionCardStyle}>
          <small>{meterLabels.satisfaction}</small>
          <h2>{formatMeterValue(meters.satisfaction)}%</h2>
        </div>
      </div>
    </>
  );
};

export default RunStatsCards;
