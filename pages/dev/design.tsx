import Head from 'next/head';
import ReviewDesk from '../../components/work/ReviewDesk';
import CharacterAvatar from '../../components/common/CharacterAvatar';
import { MS_PER_GAME_MINUTE, WORK_DAY_MINUTES } from '../../constants/game';
import { minutesToClock } from '../../utils/helpers';
import AudioControls from '../../components/common/AudioControls';
import PRArrivalNotice from '../../components/common/PRArrivalNotice';
import { useAudioCue } from '../../hooks/useAudioCue';
import { usePRArrivalNotice } from '../../hooks/usePRArrivalNotice';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTranslations } from '../../hooks/useTranslations';
import { evaluateDecision, type DecisionReceipt, type ReviewVerdict } from '../../utils/decision';
import { normalizePullRequest } from '../../utils/templateNormalization';
import { studyTeam, studyReview, initialStudyQueue, completeStudyReview, type StudyPerson as Person, type StudyExpression } from '../../constants/designStudyTeam';
import type { MeterSet } from '../../types';
import styles from '../../styles/DesignStudy.module.css';

const initialMeters: MeterSet = { stability: 92, velocity: 74, satisfaction: 86 };
const people = studyTeam.map(person => person.id);
const names = Object.fromEntries(studyTeam.map(person => [person.id, person.name]));
function Portrait({ person, expression = 'neutral', size = 48 }: { person: Person; expression?: StudyExpression; size?: number }) {
  return <CharacterAvatar characterId={person} name={names[person]} expression={expression} size={size} className={styles.portrait} />;
}
export default function DesignStudy() {
  const translations = useTranslations();
  const t = translations.designStudy;
  const { locale, setLocale } = useLocale();
  const [dark, setDark] = useState(false);
  const [swipe, setSwipe] = useState<ReviewVerdict | null>(null);
  const completed = swipe !== null;
  const decisionLocked = useRef(false);
  const [view, setView] = useState<'desk' | 'cast'>('desk');
  const [reviewQueue, setReviewQueue] = useState(initialStudyQueue);
  const sequence = reviewQueue.active;
  const [reviewedCount, setReviewedCount] = useState(0);
  const [day, setDay] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const shiftEnded = currentTime >= WORK_DAY_MINUTES;
  const person = studyTeam[sequence % studyTeam.length].id;
  const current = studyReview(sequence, locale);
  const profile = studyTeam[sequence % studyTeam.length];
  const [selected, setSelected] = useState<number[]>([]);
  const [receipt, setReceipt] = useState<(DecisionReceipt & { person: Person }) | null>(null);
  const [meters, setMeters] = useState(initialMeters);
  const audio = useAudioCue(meters);
  const arrivalNotice = usePRArrivalNotice(reviewQueue.pending.map(id => String(id)), audio.playArrivalCue);
  const [panel, setPanel] = useState<'rules' | 'queue' | 'audio' | null>(null);
  // The local preview shares the game's clock rate. Pause while reading settings
  // or meeting the cast; the live game clock remains owned by GameContext.
  const clockRunning = view === 'desk' && panel === null && !shiftEnded;
  useEffect(() => {
    if (!clockRunning) return;
    const timer = window.setInterval(() => setCurrentTime(minute => Math.min(minute + 1, WORK_DAY_MINUTES)), MS_PER_GAME_MINUTE);
    return () => window.clearInterval(timer);
  }, [clockRunning]);
  const nextShift = () => {
    setDay(value => value + 1);
    setCurrentTime(0);
    setReviewedCount(0);
    setMeters(initialMeters);
    setReceipt(null);
    setSelected([]);
  };
  const dialog = useRef<HTMLDialogElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => { sidebar.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sequence]);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (panel) { previousFocus.current = document.activeElement as HTMLElement; dialog.current?.showModal(); }
    else { dialog.current?.close(); previousFocus.current?.focus(); }
  }, [panel]);
  const title = (who: Person) => studyTeam.find(p => p.id === who)!.title[locale];
  const role = (who: Person) => studyTeam.find(p => p.id === who)!.role[locale];
  const filename = profile.filename;
  useEffect(() => {
    // Warm the reaction image cache before the short verdict swipe.
    for (const expression of ['pleased', 'concerned']) {
      const image = new Image();
      image.src = `/characters/studies/${person}-${expression}.png`;
    }
  }, [person]);
  useEffect(() => {
    if (!swipe) return;
    const timer = window.setTimeout(() => {
      setReviewQueue(completeStudyReview);
      setSelected([]);
      setSwipe(null);
      decisionLocked.current = false;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
    return () => window.clearTimeout(timer);
  }, [swipe]);
  const choose = (next: number) => { if (decisionLocked.current) return; setReviewQueue(queue => ({ ...queue, active: next })); setSelected([]); setSwipe(null); setPanel(null); };
  const decide = (verdict: ReviewVerdict) => {
    if (decisionLocked.current || shiftEnded) return;
    decisionLocked.current = true;
    const result = evaluateDecision(normalizePullRequest(current), verdict, selected.map(n => ({ filename, rowId: `line-${n}` })), meters);
    setReviewedCount(count => count + 1);
    setReceipt({ ...result, person }); setMeters(result.metersAfter); setSwipe(verdict);
  };
  const queue = <><div className={styles.queueHeading}><span>{t.waiting}</span><span>10</span></div>{reviewQueue.pending.map(next => { const coworker = studyTeam[next % studyTeam.length]; const importance = studyReview(next, locale).importance; return <button key={next} disabled={completed} className={`${styles.queueItem} ${sequence === next ? styles.activeQueue : ''}`} onClick={() => choose(next)} aria-pressed={sequence === next}><div className={styles.queueMeta}><Portrait person={coworker.id} size={32} /><span>{coworker.name.split(' ')[0]}</span><span>#{1042 + next}</span></div><strong>{title(coworker.id)}</strong><small><span className={styles.dot} />{role(coworker.id)}</small><span className={styles.priority} data-priority={importance}>{t.priority}: {translations.shared.importance[importance]}</span></button>; })}</>;
  const precision = receipt ? ({ precise: t.precise, untagged: t.untagged, inaccurate: t.inaccurate, mixed: t.mixed, 'not-applicable': t.notApplicable }[receipt.precision]) : '';
  const outcome = receipt ? ({ 'clean-approval': t.cleanOutcome, 'correct-rejection': t.caughtOutcome, 'buggy-approval': t.escapedOutcome, 'false-positive': t.falseOutcome }[receipt.outcome]) : '';
  return <div className={styles.study} data-dark={dark}>
    <Head><title>{`Approve Please · ${t.preview}`}</title></Head>
    <header className={styles.topbar}><Link className={styles.brand} href="/dev/design"><span className={styles.brandIcon}>↳</span>approve<span>please</span><span className={styles.brandPeriod}>.</span></Link><nav aria-label={t.preview}><button aria-pressed={view === 'desk'} onClick={() => setView('desk')}>{t.desk}</button><button aria-pressed={view === 'cast'} onClick={() => setView('cast')}>{t.cast}</button></nav><div className={styles.preferences}><button aria-label={translations.audio.settings} onClick={() => setPanel('audio')}>♫ <span>{translations.audio.button}</span></button><button aria-label={t.theme} onClick={() => setDark(!dark)}>{dark ? '☀' : '◐'} <span>{dark ? t.changeThemeLight : t.changeThemeDark}</span></button><button onClick={() => setLocale(locale === 'en' ? 'es' : 'en')} aria-label={locale === 'en' ? 'Cambiar a español' : 'Switch to English'}>{locale.toUpperCase()} ↔</button></div></header>
    {view === 'cast' ? <main className={styles.cast}><span className={styles.eyebrow}>{t.cast}</span><h1>{t.teamHeading}</h1><p>{t.teamIntro}</p><div className={styles.castGrid}>{people.map(who => <section className={styles.castCard} key={who}><div className={styles.castName}><h2>{names[who]}</h2><span>{role(who)}</span></div><div className={styles.expressions}>{(['neutral', 'pleased', 'concerned'] as const).map(expression => <figure key={expression}><Portrait person={who} expression={expression} size={160} /><figcaption>{t[expression]}</figcaption></figure>)}</div><div className={styles.scale}><span>{t.scale}</span><Portrait person={who} size={32} /><Portrait person={who} size={48} /></div><blockquote>“{studyTeam.find(p => p.id === who)!.quote[locale]}”</blockquote></section>)}</div><p>{t.portraitNote}</p><button className={styles.primary} onClick={() => setView('desk')}>{t.back} ↗</button></main> : <>
      <div className={styles.shiftbar}><div><span className={styles.eyebrow}>{t.shift(day)}</span><strong><time aria-label={t.clock}>{minutesToClock(currentTime)}</time><span> / 17:00</span></strong><span className={styles.clockNote}>{shiftEnded ? t.shiftEnded : !clockRunning ? t.paused : `${reviewedCount} ${t.reviewCount}`}</span><progress className={styles.clockProgress} aria-label={t.clock} value={currentTime} max={WORK_DAY_MINUTES} /></div><div className={styles.meters}>{(Object.keys(meters) as (keyof MeterSet)[]).map(key => <div key={key}><span>{t[key]}<b>{meters[key]}<small>/100</small></b></span><i><em style={{ width: `${meters[key]}%` }} /></i></div>)}</div><span className={styles.shiftStamp}>↗ <span>{t.deskTitle}</span></span></div>
      <div className={styles.workspace}><aside ref={sidebar} className={styles.sidebar}><h1>{t.queue}</h1><p>{t.queueHint}</p><div className={styles.queueList}>{queue}</div><div className={styles.sidebarBottom}><span className={styles.handbookIcon}>⌘</span><h3>{t.rulesIntro}</h3><button onClick={() => setPanel('rules')}>{t.rules} ↗</button><small>{t.liveRules}</small></div></aside>
      <ReviewDesk pullRequest={current} repository={t.repository} number={1042 + sequence} branch={`feat/${profile.branch} → main`} authorRole={role(person)} expression={completed && receipt ? (receipt.outcome === 'clean-approval' || receipt.outcome === 'correct-rejection' ? 'pleased' : 'concerned') : 'neutral'}
        selected={selected.map(number => ({ filename, rowId: `line-${number}` }))}
        onToggle={reference => { const number = Number(reference.rowId.replace('line-', '')); setSelected(values => values.includes(number) ? values.filter(value => value !== number) : [...values, number]); }}
        onClear={() => setSelected([])} onVerdict={decide} disabled={shiftEnded} swipe={swipe} queueCount={reviewQueue.pending.length} onOpenQueue={() => setPanel('queue')} onOpenRules={() => setPanel('rules')} labels={t} importanceLabels={translations.shared.importance}
        status={receipt ? `${names[receipt.person]}: ${outcome} ${precision}` : ''}>
        {shiftEnded && <section className={styles.shiftEnd} aria-labelledby="shift-end-title"><div role="status"><h2 id="shift-end-title">{t.shiftEnded}</h2><p>{reviewedCount} {t.reviewCount}. {t.shiftSummary}</p></div><button className={styles.primary} onClick={nextShift} disabled={completed}>{t.nextShift}</button></section>}
      </ReviewDesk></div>
    </>}
    <PRArrivalNotice notice={arrivalNotice} />
    <dialog ref={dialog} className={styles.dialog} onCancel={e => { e.preventDefault(); setPanel(null); }} onClick={e => { if (e.target === dialog.current) setPanel(null); }} aria-labelledby="study-dialog-title"><div className={styles.dialogTop}><h2 id="study-dialog-title">{panel === 'queue' ? t.queue : panel === 'audio' ? translations.audio.title : t.handbookTitle}</h2><button onClick={() => setPanel(null)} aria-label={t.close}>×</button></div>{panel === 'queue' ? queue : panel === 'audio' ? <AudioControls audio={audio} /> : <><span className={styles.handbookIcon}>⌘</span><h3>{t.rulesIntro}</h3><p>{t.rulesBody}</p><p>{t.emptySelection}</p><small>{t.rulesNote}</small></>}</dialog>
  </div>;
}
export const getServerSideProps: GetServerSideProps = async () => process.env.NODE_ENV === 'production' ? { notFound: true } : { props: {} };
