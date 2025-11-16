import styles from '../../styles/Desk.module.css';

interface MeterBarProps {
  label: string;
  value: number;
}

const MeterBar = ({ label, value }: MeterBarProps) => {
  return (
    <div className={styles.meterBar}>
      <div className={styles.meterHeader}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className={styles.meterTrack}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

export default MeterBar;
