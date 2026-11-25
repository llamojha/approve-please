import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import BrandMark from '../components/common/BrandMark';
import CharacterAvatar from '../components/common/CharacterAvatar';
import PlainTextDiff from '../components/basics/PlainTextDiff';
import ReviewDesk, { type ReviewDeskLabels } from '../components/work/ReviewDesk';
import { basicsCopy } from '../constants/basicsCopy';
import { SITE_METADATA } from '../constants/siteMetadata';
import { basicsLessons } from '../data/basics';
import { getCharacter } from '../data/characters';
import { useLocale } from '../context/LocaleContext';
import { useUIPreferences } from '../context/UIPreferencesContext';
import type { ReviewVerdict } from '../utils/decision';
import type { PullRequest } from '../types';
import { BASICS_STORAGE_KEY, evidenceKeys, expectedVerdict, initialBasicsProgress, lessonStats, recordBasicsAttempt, restoreBasicsProgress, rowKey } from '../utils/basics';
import styles from '../styles/Basics.module.css';

export default function LearnPage() {
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useUIPreferences();
  const t = basicsCopy[locale];
  const [progress, setProgress] = useState(initialBasicsProgress);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [retrying, setRetrying] = useState(false);
  const [recap, setRecap] = useState(false);
  const [guide, setGuide] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const feedback = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lessonNavigation = useRef<HTMLElement>(null);
  const resetPanel = useRef<HTMLElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const [focusFeedback, setFocusFeedback] = useState(false);
  const lessonIndex = basicsLessons.findIndex(item => item.id === progress.lessonId);
  const lesson = basicsLessons[lessonIndex];
  const exercise = lesson.exercises[progress.exerciseIndex];
  const attempt = progress.attempts[exercise.id];
  const revealed = Boolean(attempt) && !retrying;
  const correct = attempt?.verdict === expectedVerdict(exercise);
  const character = getCharacter(exercise.authorId)!;
  const stats = lessonStats(lesson.id, progress);
  const courseCount = Object.keys(progress.attempts).length;

  useEffect(() => {
    try { setProgress(restoreBasicsProgress(window.localStorage.getItem(BASICS_STORAGE_KEY))); }
    catch { setStorageError(true); }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(BASICS_STORAGE_KEY, JSON.stringify(progress)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [loaded, progress]);
  useEffect(() => {
    if (focusFeedback) { feedback.current?.focus(); setFocusFeedback(false); }
  }, [focusFeedback]);
  useEffect(() => { if (resetOpen) resetPanel.current?.focus(); }, [resetOpen]);

  const submit = useCallback((verdict: ReviewVerdict) => {
    if (!loaded || revealed || recap || resetOpen || !progress.introSeen) return;
    setProgress(current => recordBasicsAttempt(current, exercise, verdict, selected));
    setRetrying(false);
    setFocusFeedback(true);
  }, [loaded, revealed, recap, resetOpen, progress.introSeen, exercise, selected]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'r') {
        event.preventDefault(); submit(event.key.toLowerCase() === 'a' ? 'approve' : 'request-changes');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submit]);

  const navigate = (lessonId: string, exerciseIndex = 0) => {
    setProgress(current => ({ ...current, introSeen: true, lessonId, exerciseIndex }));
    setSelected([]); setRetrying(false); setRecap(false); setGuide(false); setResetOpen(false);
    stage.current?.focus();
  };
  const toggle = (key: string) => setSelected(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  const labels: ReviewDeskLabels = {
    queue: t.lessons, rules: t.guide, open: t.open, reviewedBadge: t.reviewedBadge, priority: '', branch: t.branch,
    prDescription: t.description, authorNote: t.authorNote, codeLabel: t.diff, select: t.select, additions: t.additions,
    selected: t.selected, optional: t.optional, clear: t.clear, request: t.reject, approve: t.approve, tags: t.tags, language: t.language,
  };
  // Presentation adapter only; student review uses explicit requirements and issue locations, not game scoring.
  const pr: PullRequest = {
    id: exercise.id, templateId: exercise.id, title: exercise.title[locale], author: character.name, authorId: character.id,
    description: t.note, tags: [], files: [], bugPatterns: [], importance: 'low', estimatedReviewSeconds: 0,
  };
  const issueKeys = evidenceKeys(exercise);
  const visibleFlags = revealed ? attempt.tagged : selected;
  const matched = visibleFlags.filter(key => issueKeys.includes(key)).length;
  const resultLabel = (verdict: ReviewVerdict) => verdict === 'approve' ? t.approve : t.reject;

  return <div className={styles.shell} data-dark={theme === 'githob-dark'}>
    <Head><title>{`${t.name} · Approve Please`}</title><meta name="description" content={t.entryBody} /><link key="canonical" rel="canonical" href={`${SITE_METADATA.url}/learn`} /></Head>
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label={t.home}><BrandMark /> <span>approve<b>please.</b></span></Link>
      <span className={styles.courseName}>{t.name}</span>
      <div className={styles.tools}>
        <button type="button" onClick={toggleTheme} aria-label={locale === 'en' ? 'Toggle light and dark theme' : 'Cambiar tema claro u oscuro'} aria-pressed={theme === 'githob-dark'}>◐</button>
        <button type="button" onClick={() => setLocale(locale === 'en' ? 'es' : 'en')} aria-label={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}>{locale.toUpperCase()} ↔</button>
        {progress.introSeen && <button type="button" ref={resetButton} onClick={() => setResetOpen(true)}>{t.reset}</button>}
      </div>
    </header>
    {!loaded ? <p className={styles.loading} role="status">…</p> : !progress.introSeen ? <main className={styles.intro}>
      <p className={styles.eyebrow}>{t.noClock}</p><h1>{t.introTitle}</h1><p className={styles.lead}>{t.intro}</p>
      <div className={styles.concepts}>{[[t.branch,t.branchBody],[t.diff,t.diffBody],[t.merge,t.mergeBody]].map(([title,body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}</div>
      <p>{t.scope}</p><button type="button" className={styles.primary} onClick={() => setProgress(current => ({ ...current, introSeen: true }))}>{courseCount ? t.resume : t.start} →</button>
      <p className={styles.muted}>{storageError ? t.storageError : t.saved}</p>
    </main> : <>
      <section className={styles.progressBar} aria-label={t.progress}><div><strong>{t.name}</strong><span>{t.noClock}</span></div><div><span>{courseCount} / 60 {t.reviewed}</span><progress max={60} value={courseCount} aria-label={t.progress} /></div></section>
      {storageError && <p className={styles.guide} role="status">{t.storageError}</p>}
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <nav aria-label={t.lessons} ref={lessonNavigation} tabIndex={-1}><h2>{t.lessons}</h2>{basicsLessons.map((item,index) => {
            const count = lessonStats(item.id, progress).reviewed;
            return <button type="button" key={item.id} aria-current={item.id === lesson.id ? 'step' : undefined} onClick={() => navigate(item.id)}><span>{String(index + 1).padStart(2,'0')}</span><span><strong>{item.title[locale]}</strong><small>{count} / {item.exercises.length} {t.reviewed}</small></span>{count === item.exercises.length && <span aria-label={locale === 'en' ? 'Completed' : 'Completada'}>✓</span>}</button>;
          })}</nav>
          <p className={styles.muted}>{storageError ? t.storageError : t.saved}</p>
          <Link href="/">← {t.home}</Link>
        </aside>
        <div className={styles.stage} ref={stage} tabIndex={-1}>
          <div className={styles.lessonHeader}><div><p className={styles.eyebrow}>{t.lesson} {lessonIndex + 1} / 6</p><h2>{lesson.title[locale]}</h2><p>{lesson.focus[locale]}</p></div><div className={styles.lessonTools}><button type="button" aria-expanded={guide} onClick={() => setGuide(value => !value)}>{guide ? t.hideGuide : t.guide}</button>{stats.reviewed > 0 && <button type="button" onClick={() => { setRecap(value => !value); setRetrying(false); }}>{recap ? t.resume : t.recap}</button>}</div></div>
          {guide && <aside className={styles.guide}><h3>{t.guide}</h3><p>{lesson.tip[locale]}</p><p>{t.scope}</p></aside>}
          {recap ? <main className={styles.recap}>
            <h1>{t.recapTitle}</h1><p>{t.recapBody}</p><div className={styles.score}><strong>{stats.firstCorrect} / {stats.reviewed}</strong><span>{t.firstTry}</span></div>
            {[true,false].map(wentWell => {
              const items = lesson.exercises.filter(item => progress.attempts[item.id] && (progress.attempts[item.id].firstVerdict === expectedVerdict(item)) === wentWell);
              return <section key={String(wentWell)}><h2>{wentWell ? t.well : t.practise}</h2>{items.length === 0 && <p>{wentWell ? (stats.reviewed ? t.noneWell : t.noneYet) : t.allPractice}</p>}{items.map(item => {
                const record = progress.attempts[item.id];
                return <article key={item.id} data-correct={wentWell}><h3>{item.title[locale]}</h3><p><strong>{expectedVerdict(item) === 'approve' ? t.expectedApprove : t.expectedReject}</strong></p><p>{item.explanation[locale]}</p><small>{t.firstDecision}: {resultLabel(record.firstVerdict)} · {t.latest}: {resultLabel(record.verdict)} · {t.attempts}: {record.attempts}</small><button type="button" onClick={() => navigate(lesson.id,lesson.exercises.indexOf(item))}>{t.inspect} →</button></article>;
              })}</section>;
            })}
            {stats.reviewed === lesson.exercises.length && lessonIndex < basicsLessons.length - 1 && <button type="button" className={styles.primary} onClick={() => navigate(basicsLessons[lessonIndex + 1].id)}>{t.nextLesson} →</button>}
            {courseCount === 60 && <p className={styles.guide}>{t.courseDone}</p>}
          </main> : <>
            <p className={styles.reviewCount}>{t.review} {progress.exerciseIndex + 1} / {lesson.exercises.length}</p>
            <ReviewDesk pullRequest={pr} repository="campus / shared-notes" number={`${lessonIndex + 1}${String(progress.exerciseIndex + 1).padStart(2,'0')}`}
              branch={`update/${exercise.id} → main`} authorRole={t.teammate} expression={revealed ? correct ? 'pleased' : 'concerned' : 'neutral'} showPriority={false} reviewed={revealed}
              selected={visibleFlags.map(key => { const [filename,rowId] = key.split('|'); return { filename,rowId }; })}
              onToggle={reference => toggle(rowKey(reference.filename, reference.rowId))} onClear={() => setSelected([])} onVerdict={submit} disabled={revealed || resetOpen}
              queueCount={6} onOpenQueue={() => lessonNavigation.current?.focus()} onOpenRules={() => setGuide(value => !value)} labels={labels} importanceLabels={{low:'',normal:'',high:''}}
              diffSlot={<PlainTextDiff exercise={exercise} locale={locale} selected={visibleFlags} onToggle={toggle} disabled={revealed || resetOpen} reveal={revealed} />}>
              <section className={styles.brief}><h2>{t.brief}</h2><p>{exercise.brief[locale]}</p></section>
            </ReviewDesk>
            {revealed && <section ref={feedback} tabIndex={-1} className={styles.feedback} data-correct={correct} aria-labelledby="feedback-heading">
              <div className={styles.feedbackTitle}><CharacterAvatar characterId={character.id} name={character.name} expression={correct ? 'pleased' : 'concerned'} /><div><h2 id="feedback-heading">{correct ? t.right : t.wrong}</h2><p>{expectedVerdict(exercise) === 'approve' ? t.expectedApprove : t.expectedReject}</p></div></div>
              <p>{correct ? attempt.verdict === 'approve' ? t.merged : t.blocked : attempt.verdict === 'approve' ? t.unsafe : t.unnecessary}</p>
              <h3>{t.why}</h3><p>{exercise.explanation[locale]}</p>
              {exercise.issues.length > 0 ? <><h3>{t.evidence}</h3><ul>{exercise.issues.map(item => <li key={`${item.filename}:${item.side}:${item.line}`}><strong>{item.filename}</strong> · {item.side === 'before' ? t.before : t.after} {item.line}</li>)}</ul><p>{t.flags(matched, issueKeys.length, visibleFlags.length - matched)}</p><p className={styles.muted}>{t.feedbackHint}</p></> : <p>{t.noEvidence}</p>}
              <div className={styles.feedbackActions}><button type="button" onClick={() => { setRetrying(true); setSelected([]); stage.current?.focus(); }}>{t.retry}</button><button type="button" className={styles.primary} onClick={() => { if (progress.exerciseIndex === lesson.exercises.length - 1) { setRecap(true); stage.current?.focus(); } else navigate(lesson.id,progress.exerciseIndex + 1); }}>{progress.exerciseIndex === lesson.exercises.length - 1 ? t.recap : t.next} →</button></div>
            </section>}
            <p className={styles.shortcuts}>{t.shortcuts}</p>
          </>}
        </div>
      </div>
    </>}
    {resetOpen && <section ref={resetPanel} tabIndex={-1} className={styles.reset} role="region" aria-label={t.resetQuestion}><h2>{t.resetQuestion}</h2><p>{t.resetBody}</p><button type="button" onClick={() => { setProgress(initialBasicsProgress()); setSelected([]); setRetrying(false); setRecap(false); setGuide(false); setResetOpen(false); }}>{t.confirmReset}</button><button type="button" onClick={() => { setResetOpen(false); resetButton.current?.focus(); }}>{t.cancel}</button></section>}
  </div>;
}
