import styles from '../../styles/Screen.module.css';
import { useGameState } from '../../context/GameContext';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';
import CharacterAvatar from '../common/CharacterAvatar';
import { basicsDay } from '../../utils/basicsGame';
import { basicsCopy } from '../../constants/basicsCopy';

const BriefingScreen = () => {
  const {
    state: { currentDay, currentMantra, dayQuote, contentTrack },
    savedRun,
    savedRunPromptPending,
    actions: { startWork, resumeSavedRun, discardSavedRun }
  } = useGameState();
  const translations = useTranslations();
  const { locale } = useLocale();
  const beginner = contentTrack === 'basics';
  const b = basicsCopy[locale];
  const day = basicsDay(currentDay);

  const dayDescriptor = currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback;

  const quoteText = dayQuote ? dayQuote.text[locale] ?? dayQuote.text.en : null;
  const quoteRole = dayQuote ? dayQuote.role[locale] ?? dayQuote.role.en : null;

  if (savedRun && savedRunPromptPending) {
    return <main className={styles.screenShell}><section className={`${styles.screenCard} ${styles.briefingCard}`}>
      <p className={styles.eyebrow}>{translations.briefing.eyebrow}</p>
      <h1>{translations.briefing.savedHeading}</h1>
      <p className={styles.screenLead}>{translations.briefing.savedBody}</p>
      <div className={styles.screenActions}><button type="button" className={styles.screenButton} onClick={resumeSavedRun}>{translations.briefing.resumeButton}</button><button type="button" className={`${styles.screenButton} ${styles.screenButtonSecondary}`} onClick={discardSavedRun}>{translations.briefing.newButton}</button></div>
    </section></main>;
  }

  return (
    <main className={styles.screenShell}>
      <section className={`${styles.screenCard} ${styles.briefingCard}`}>
        <p className={styles.eyebrow}>{beginner ? b.eyebrow : translations.briefing.eyebrow}</p>
        <div className={styles.briefingHeading}>
          <span>{translations.designStudy.shift(currentDay)}</span>
          <h1>{beginner ? day?.title[locale] : dayDescriptor}</h1>
        </div>
        <p className={styles.screenLead}>{beginner ? b.briefing : translations.briefing.body}</p>
        {beginner && currentDay === 1 && <p>{b.first}</p>}
        {dayQuote && quoteText && (
          <div className={styles.briefingQuoteCard}>
            <CharacterAvatar characterId={dayQuote.characterId} name={dayQuote.speaker} size={64} />
            <blockquote className={styles.briefingQuote}>
              <p>&ldquo;{beginner ? b.teamQuote : quoteText}&rdquo;</p>
              <footer><strong>{dayQuote.speaker}</strong>{quoteRole && <span>{quoteRole}</span>}</footer>
            </blockquote>
          </div>
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
