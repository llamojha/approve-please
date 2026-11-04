import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';

const BriefingScreen = () => {
  const {
    state: { currentDay, currentMantra, dayQuote },
    savedRun,
    savedRunPromptPending,
    actions: { startWork, resumeSavedRun, discardSavedRun }
  } = useGameState();
  const translations = useTranslations();
  const { locale } = useLocale();

  const dayDescriptor = currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback;

  const quoteText = dayQuote ? dayQuote.text[locale] ?? dayQuote.text.en : null;
  const quoteRole = dayQuote ? dayQuote.role[locale] ?? dayQuote.role.en : null;

  if (savedRun && savedRunPromptPending) {
    return <main className={styles.screenShell}><section className={styles.screenCard}>
      <p className={styles.eyebrow}>{translations.briefing.eyebrow}</p>
      <h1>{translations.briefing.savedHeading}</h1>
      <p className={styles.screenLead}>{translations.briefing.savedBody}</p>
      <div className={styles.screenActions}><button type="button" className={styles.screenButton} onClick={resumeSavedRun}>{translations.briefing.resumeButton}</button><button type="button" className={`${styles.screenButton} ${styles.screenButtonSecondary}`} onClick={discardSavedRun}>{translations.briefing.newButton}</button></div>
    </section></main>;
  }

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <p className={styles.eyebrow}>{translations.briefing.eyebrow}</p>
        <h1>{translations.shared.dayHeading(currentDay, dayDescriptor)}</h1>
        <p className={styles.screenLead}>{translations.briefing.body}</p>
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
