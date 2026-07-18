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
    <div className={styles.railCard}>
      <span className={styles.railEyebrow}>— DAY {day}</span>
      <p className={styles.briefMantra}>{descriptor}</p>
      {dayQuote && quoteText ? (
        <blockquote className={styles.briefQuote}>
          {`“${quoteText}”`}
          <footer className={styles.briefQuoteFooter}>
            — {dayQuote.speaker.toUpperCase()}
            {quoteRole ? ` · ${quoteRole.toUpperCase()}` : ''}
          </footer>
        </blockquote>
      ) : (
        <p className={styles.rulebookEmpty}>{translations.work.rulebook.empty}</p>
      )}
    </div>
  );
};

export default RulebookPanel;
