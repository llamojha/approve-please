import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { Rule, DayQuote } from '../../types';

interface RulebookPanelProps {
  rules: Rule[];
  day: number;
  codename: string;
  dayQuote: DayQuote | null;
}

const RulebookPanel = ({ rules, day, codename, dayQuote }: RulebookPanelProps) => {
  return (
    <Panel title={`Day ${day}: ${codename}`}>
      {dayQuote && (
        <blockquote className={styles.briefingQuote}>
          <p>&ldquo;{dayQuote.text}&rdquo;</p>
          <footer>— {dayQuote.speaker}</footer>
        </blockquote>
      )}
      <ol className={styles.ruleList}>
        {rules.map((rule) => (
          <li key={rule.id}>
            <strong>{rule.description}</strong>
            <small>{Array.isArray(rule.appliesTo) ? rule.appliesTo.join(', ') : 'All PRs'}</small>
          </li>
        ))}
      </ol>
    </Panel>
  );
};

export default RulebookPanel;
