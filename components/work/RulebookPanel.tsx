import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { DayQuote } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';

interface RulebookPanelProps {
  day: number;
  mantra: string;
  dayQuote: DayQuote | null;
}

const RulebookPanel = ({ day, dayQuote, mantra }: RulebookPanelProps) => {
  const translations = useTranslations();
  const { locale } = useLocale();
  const descriptor = mantra || translations.shared.operationsFallback;
  const quoteText = dayQuote ? dayQuote.text[locale] ?? dayQuote.text.en : null;
  const quoteRole = dayQuote ? dayQuote.role[locale] ?? dayQuote.role.en : null;

  return (
    <Panel title={translations.shared.dayHeading(day, descriptor)}>
      {dayQuote && quoteText ? (
        <blockquote className={styles.briefingQuote}>
          <p>&ldquo;{quoteText}&rdquo;</p>
          <footer>
            — {dayQuote.speaker}
            {quoteRole ? `, ${quoteRole}` : ''}
          </footer>
        </blockquote>
      ) : (
        <p className={styles.rulebookEmpty}>{translations.work.rulebook.empty}</p>
      )}
    </Panel>
  );
};

export default RulebookPanel;
