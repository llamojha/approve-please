import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';
import { minutesToClock } from '../../utils/helpers';
import { WORK_DAY_MINUTES } from '../../constants/game';

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
        <span className={styles.eyebrow}>— {translations.briefing.eyebrow(currentDay)}</span>
        <h1>{dayDescriptor}</h1>
        {dayQuote && quoteText && (
          <blockquote className={styles.briefingQuote}>
            <p>&ldquo;{quoteText}&rdquo;</p>
            <footer>
              — {dayQuote.speaker}
              {quoteRole ? ` · ${quoteRole}` : ''}
            </footer>
          </blockquote>
        )}
        <div className={styles.screenActions}>
          <button type="button" className={styles.screenButton} onClick={startWork}>
            {translations.briefing.startButton} →
          </button>
          <span className={styles.shiftMeta}>
            {minutesToClock(0)} — {minutesToClock(WORK_DAY_MINUTES)}
          </span>
        </div>
      </section>
    </main>
  );
};

export default BriefingScreen;
