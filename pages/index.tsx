import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useGameState } from '../context/GameContext';
import { useLocale } from '../context/LocaleContext';
import { useTranslations } from '../hooks/useTranslations';
import { LOCALE_OPTIONS } from '../constants/i18n';
import { characters } from '../data/characters';
import LeaderboardModal from '../components/common/LeaderboardModal';
import styles from '../styles/Landing.module.css';

const languages = ['generic', 'typescript', 'javascript', 'python', 'java', 'rust', 'css'];
const difficulties = ['normal', 'learning'] as const;
const guideSymbols = ['↳', '⌕', '✓', '▥', '↗', '↶'];
const riya = characters.find(person => person.id === 'riya')!;

export default function IndexPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const translations = useTranslations();
  const landing = translations.landing;
  const t = landing.refresh;
  const { state: { languagePreference, difficulty }, savedRun, actions: { setLanguagePreference, setDifficulty, resumeSavedRun, discardSavedRun } } = useGameState();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const guide = useRef<HTMLDialogElement>(null);
  const slides = landing.tutorialSlides;
  const slide = slides[slideIndex];

  useEffect(() => {
    if (!tutorialOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    guide.current?.showModal();
    document.body.style.overflow = 'hidden';
    const modal = guide.current;
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [tutorialOpen]);

  const openGuide = () => { setSlideIndex(0); setTutorialOpen(true); };
  const toggleLanguage = (value: string) => {
    if (languagePreference.includes(value)) {
      if (languagePreference.length > 1) setLanguagePreference(languagePreference.filter(item => item !== value));
    } else setLanguagePreference([...languagePreference, value]);
  };

  return <div className={styles.landing}>
    <Head><title>{`Approve Please · ${t.headline}`}</title><meta name="description" content={t.intro} /></Head>
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label={t.home}><span aria-hidden="true">↳</span>approve<b>please</b><i>.</i></Link>
        <span className={styles.studio}>{t.studio}</span>
        <nav aria-label={t.home}><button onClick={openGuide}>{t.howToPlay}</button><button onClick={() => setLeaderboardOpen(true)}>{t.leaderboard}</button></nav>
        <div className={styles.localeToggle} role="group" aria-label={translations.localeToggleLabel}>{LOCALE_OPTIONS.map(({ value, label }) => <button key={value} onClick={() => setLocale(value)} aria-pressed={locale === value}>{label}</button>)}</div>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span aria-hidden="true">●</span> {t.eyebrow}</p>
            <h1 id="landing-title">{t.headline}<br /><em>{t.headlineEnd}</em></h1>
            <p className={styles.intro}>{t.intro}</p>
            <div className={styles.heroActions}><a className={styles.primary} href="#setup">{t.takeSeat}<span aria-hidden="true">↗</span></a><button className={styles.textButton} onClick={openGuide}>{t.howToPlay} <span aria-hidden="true">→</span></button></div>
            <p className={styles.timing}><span aria-hidden="true">◷</span> {t.timing}</p>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.paperBack} aria-hidden="true" />
            <article className={styles.preview} aria-label={t.previewLabel}>
              <div className={styles.previewTop}><span>◇ afterhours / small-hours</span><span aria-hidden="true">↗</span></div>
              <div className={styles.previewBody}><span className={styles.status}><span aria-hidden="true">●</span> {t.previewStatus}</span><h2>{t.previewTitle}</h2><div className={styles.previewAuthor}><Image unoptimized src="/characters/studies/riya-neutral.png" alt="" width={64} height={64} priority /><div><strong>{riya.name}</strong><span>{riya.role[locale]}</span></div></div><p className={styles.comment}>{t.previewComment}</p></div>
              <div className={styles.miniDiff} aria-hidden="true"><div>{t.previewFile}<span>+3</span></div><code><span>1  +  const change = &apos;tiny&apos;;</span><span>2  +  await ship(change);</span><span>3  +  // ...</span></code></div>
              <div className={styles.previewBottom}><span aria-hidden="true">↳</span>{t.pending}</div>
            </article>
            <div className={styles.waitingPortraits} aria-hidden="true"><Image unoptimized src="/characters/studies/lucia-neutral.png" alt="" width={64} height={64} /><Image unoptimized src="/characters/studies/diego-neutral.png" alt="" width={64} height={64} /><span>+8</span></div>
          </div>
        </section>
        <section className={styles.stakes} aria-label={t.meterIntro}>
          <p>{t.meterIntro}</p>
          <div className={styles.stake}><span className={styles.green} aria-hidden="true">↟</span><div><strong>{translations.shared.meters.stability}</strong><span>{t.stability}</span></div></div>
          <div className={styles.stake}><span className={styles.purple} aria-hidden="true">↗</span><div><strong>{translations.shared.meters.velocity}</strong><span>{t.velocity}</span></div></div>
          <div className={styles.stake}><span className={styles.amber} aria-hidden="true">✳</span><div><strong>{t.teamTrust}</strong><span>{t.trust}</span></div></div>
        </section>
        <section id="setup" className={styles.setup} aria-labelledby="setup-title" tabIndex={-1}>
          <div className={styles.setupIntro}><p className={styles.eyebrow}>{t.setupEyebrow}</p><h2 id="setup-title">{t.setupHeading}</h2><p>{t.setupIntro}</p><Image unoptimized src="/characters/studies/lucia-neutral.png" alt="" width={120} height={120} /></div>
          <div className={styles.setupForm}>
            <fieldset className={styles.languages}><legend>{t.languageLegend}</legend><p id="language-hint">{t.languageHint}</p><div className={styles.languageOptions} aria-describedby="language-hint">{languages.map(value => <button key={value} type="button" aria-pressed={languagePreference.includes(value)} onClick={() => toggleLanguage(value)} title={languagePreference.length === 1 && languagePreference.includes(value) ? t.minimumLanguage : undefined}><span aria-hidden="true">{languagePreference.includes(value) ? '✓' : '+'}</span>{value === 'generic' ? t.genericLabel : landing.languageOptions[value] ?? value}</button>)}</div><small aria-live="polite">{t.selected(languagePreference.length)} · {t.minimumLanguage}</small></fieldset>
            <fieldset className={styles.difficulty}><legend>{t.difficultyLegend}</legend><div>{difficulties.map(value => <label key={value} className={difficulty === value ? styles.selectedDifficulty : ''}><input type="radio" name="difficulty" value={value} checked={difficulty === value} onChange={() => setDifficulty(value)} /><span><strong>{value === 'normal' ? t.normalTitle : t.learningTitle}</strong><span>{value === 'normal' ? t.normalDescription : t.learningDescription}</span></span></label>)}</div></fieldset>
            {savedRun ? <div className={styles.resumeBlock}><button type="button" className={`${styles.primary} ${styles.start}`} onClick={() => { resumeSavedRun(); void router.push('/game'); }}>{t.resume(savedRun.state.currentDay)}<span aria-hidden="true">→</span></button><p className={styles.startHint}>{t.resumeHint(new Date(savedRun.savedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }))}</p><button type="button" className={styles.newRun} onClick={() => { discardSavedRun(); void router.push('/game'); }}>{t.newRun}</button></div> : <><button type="button" className={`${styles.primary} ${styles.start}`} onClick={() => { discardSavedRun(); void router.push('/game'); }}>{t.start}<span aria-hidden="true">→</span></button><p className={styles.startHint}>{t.startHint}</p></>}
          </div>
        </section>
        <section className={styles.team} aria-labelledby="team-title"><div><h2 id="team-title">{t.teamHeading}</h2><p>{t.teamIntro}</p></div><ul>{characters.map(person => <li key={person.id}><Image unoptimized src={`/characters/studies/${person.id}-neutral.png`} alt="" width={64} height={64} /><strong>{person.name.split(' ')[0]}</strong><span>{person.role[locale]}</span></li>)}</ul></section>
      </main>
      <footer className={styles.footer}><span>approve please.</span><p>{t.footer}</p><span aria-hidden="true">↳</span></footer>
    </div>
    <dialog ref={guide} className={styles.guideModal} aria-labelledby="guide-title" onCancel={() => setTutorialOpen(false)} onClick={event => { if (event.target === guide.current) setTutorialOpen(false); }}>
      <div className={styles.guideHeader}><span className={styles.eyebrow}>{t.guideEyebrow}</span><button aria-label={t.close} onClick={() => setTutorialOpen(false)}>×</button></div>
      <div className={styles.guideBody}><div className={styles.guideIllustration} aria-hidden="true"><span>{guideSymbols[slideIndex]}</span><Image unoptimized src="/characters/studies/riya-neutral.png" alt="" width={144} height={144} /></div><div><p className={styles.eyebrow} aria-live="polite">{landing.tutorialNav.slideOf(slideIndex + 1, slides.length)}</p><h2 id="guide-title">{slide.title}</h2><ul>{slide.description.map(line => <li key={line}>{line}</li>)}</ul></div></div>
      <p className={styles.guideNote}>{t.guideNote}</p><div className={styles.guideControls}><button disabled={slideIndex === 0} onClick={() => setSlideIndex(index => index - 1)}>{landing.tutorialNav.prev}</button><button className={styles.primary} onClick={() => { if (slideIndex === slides.length - 1) setTutorialOpen(false); else setSlideIndex(index => index + 1); }}>{slideIndex === slides.length - 1 ? t.guideFinish : landing.tutorialNav.next}</button></div>
    </dialog>
    <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} mode={difficulty} />
  </div>;
}
