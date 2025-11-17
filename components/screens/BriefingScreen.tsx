import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';

const BriefingScreen = () => {
  const {
    state: { currentDay, currentMantra, dayQuote },
    actions: { startWork }
  } = useGameState();
  const translations = useTranslations();
  const { locale } = useLocale();

  const dayDescriptor = currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback;

  const quoteText = dayQuote ? dayQuote.text[locale] ?? dayQuote.text.en : null;
  const quoteRole = dayQuote ? dayQuote.role[locale] ?? dayQuote.role.en : null;

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <h1>{translations.shared.dayHeading(currentDay, dayDescriptor)}</h1>
        {dayQuote && quoteText && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{quoteText}&rdquo;</p>
            <footer>
              — {dayQuote.speaker}
              {quoteRole ? `, ${quoteRole}` : ''}
            </footer>
          </blockquote>
        )}
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={startWork}>
            {translations.briefing.startButton}
          </button>
        </div>
      </section>
    </main>
  );
};

export default BriefingScreen;
