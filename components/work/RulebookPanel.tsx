import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { Rule, DayQuote } from '../../types';

interface RulebookPanelProps {
  rules: Rule[];
  day: number;
  codename: string;
  mood: string;
  dayQuote: DayQuote | null;
}

const RulebookPanel = ({ rules, day, codename, dayQuote, mood }: RulebookPanelProps) => {
  const headingDescriptor = mood || codename || 'Operations';

  return (
    <Panel title={`Day ${day} – ${headingDescriptor}`}>
      {dayQuote && (
        <blockquote className={styles.briefingQuote}>
          <p>&ldquo;{dayQuote.text}&rdquo;</p>
          <footer>— {dayQuote.speaker}</footer>
        </blockquote>
      )}
      {rules.length > 0 ? (
        <ol className={styles.ruleList}>
          {rules.map((rule) => (
            <li key={rule.id}>
              <strong>{rule.description}</strong>
              <small>{Array.isArray(rule.appliesTo) ? rule.appliesTo.join(', ') : 'All PRs'}</small>
            </li>
          ))}
        </ol>
      ) : null}
    </Panel>
  );
};

export default RulebookPanel;
