import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { DayQuote } from '../../types';

interface RulebookPanelProps {
  day: number;
  mantra: string;
  dayQuote: DayQuote | null;
}

const RulebookPanel = ({ day, dayQuote, mantra }: RulebookPanelProps) => {
  const headingDescriptor = mantra || 'Operations';

  return (
    <Panel title={`Day ${day} – ${headingDescriptor}`}>
      {dayQuote ? (
        <blockquote className={styles.briefingQuote}>
          <p>&ldquo;{dayQuote.text}&rdquo;</p>
          <footer>— {dayQuote.speaker}</footer>
        </blockquote>
      ) : (
        <p className={styles.rulebookEmpty}>No directives today. Trust your instincts.</p>
      )}
    </Panel>
  );
};

export default RulebookPanel;
