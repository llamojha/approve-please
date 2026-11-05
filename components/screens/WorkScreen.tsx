import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CharacterAvatar, { type CharacterExpression } from '../common/CharacterAvatar';
import ReviewDesk from '../work/ReviewDesk';
import AudioControls from '../common/AudioControls';
import PRArrivalNotice from '../common/PRArrivalNotice';
import { useGameState, type DecisionResult } from '../../context/GameContext';
import { useGameClock } from '../../hooks/useGameClock';
import { usePRSpawner } from '../../hooks/usePRSpawner';
import { useAudioCue } from '../../hooks/useAudioCue';
import { usePRArrivalNotice } from '../../hooks/usePRArrivalNotice';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';
import { getCharacter } from '../../data/characters';
import { minutesToClock } from '../../utils/helpers';
import type { LineReference, MeterSet, PullRequest } from '../../types';
import type { DecisionReceipt, ReviewVerdict } from '../../utils/decision';
import styles from '../../styles/LiveDesk.module.css';

type Panel = 'queue' | 'rules' | 'audio' | null;
interface OutgoingReview {
  pr: PullRequest;
  verdict: ReviewVerdict;
  receipt: DecisionReceipt;
  selected: LineReference[];
}

const reviewNumber = (templateId: string) => 1000 + ([...templateId].reduce((value, letter) => (value * 33 + letter.charCodeAt(0)) >>> 0, 0) % 9000);
const sameReference = (left: LineReference, right: LineReference) => left.filename === right.filename && left.rowId === right.rowId;

const WorkScreen = () => {
  const {
    state: { queue, currentPR, currentTime, counters, meters, currentMantra, currentDay, dayQuote, simulationPaused },
    actions: { selectPR, approveCurrentPR, requestChanges, setSimulationPaused }
  } = useGameState();
  const translations = useTranslations();
  const t = translations.designStudy;
  const { locale, setLocale } = useLocale();
  useGameClock();
  usePRSpawner();
  const audio = useAudioCue(meters);
  const arrivalNotice = usePRArrivalNotice(queue.map(pr => pr.id), audio.playArrivalCue);
  const [selected, setSelected] = useState<LineReference[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingReview | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [status, setStatus] = useState('');
  const decisionLocked = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setSelected([]), [currentPR?.id]);
  useEffect(() => {
    setSimulationPaused(panel === 'rules' || panel === 'audio');
    return () => setSimulationPaused(false);
  }, [panel, setSimulationPaused]);
  useEffect(() => {
    if (panel) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
      previousFocus.current?.focus();
    }
  }, [panel]);
  useEffect(() => {
    if (!outgoing) return;
    const timer = window.setTimeout(() => {
      setOutgoing(null);
      decisionLocked.current = false;
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-review-action="approve"]:not(:disabled)')?.focus());
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  const toggleLine = useCallback((reference: LineReference) => {
    if (decisionLocked.current || simulationPaused) return;
    setSelected(values => values.some(value => sameReference(value, reference))
      ? values.filter(value => !sameReference(value, reference))
      : [...values, reference]);
  }, [simulationPaused]);
  const outcomeMessage = useCallback((pr: PullRequest, result: DecisionResult) => {
    const outcome = result.receipt?.outcome;
    if (!outcome) return result.message;
    return pr.reactions?.[outcome]?.[locale] ?? pr.reactions?.[outcome]?.en ?? result.message;
  }, [locale]);
  const decide = useCallback((verdict: ReviewVerdict) => {
    const pr = currentPR;
    if (!pr || decisionLocked.current || simulationPaused || panel !== null) return;
    decisionLocked.current = true;
    const result = verdict === 'approve' ? approveCurrentPR() : requestChanges({ selectedRefs: selected });
    if (!result.success || !result.receipt) {
      decisionLocked.current = false;
      setStatus(result.message);
      return;
    }
    setStatus(`${pr.author}: ${outcomeMessage(pr, result)}`);
    setOutgoing({ pr, verdict, receipt: result.receipt, selected: [...selected] });
    if (verdict === 'approve') audio.playCue(520, 0.1);
    else audio.playCue(360, 0.15);
  }, [currentPR, simulationPaused, panel, approveCurrentPR, requestChanges, selected, outcomeMessage, audio]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editable = target?.matches('input, textarea, select, [contenteditable="true"]');
      if (event.repeat || event.defaultPrevented || !event.altKey || event.ctrlKey || event.metaKey || editable || panel || outgoing || simulationPaused) return;
      if (event.key.toLowerCase() === 'a' && currentPR) { event.preventDefault(); decide('approve'); }
      else if (event.key.toLowerCase() === 'r' && currentPR) { event.preventDefault(); decide('request-changes'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPR, decide, outgoing, panel, simulationPaused]);

  const displayPR = outgoing?.pr ?? currentPR;
  const displaySelected = outgoing?.selected ?? selected;
  const displayCharacter = getCharacter(displayPR?.authorId);
  const expression: CharacterExpression = outgoing ? outgoing.receipt.correct ? 'pleased' : 'concerned' : 'neutral';
  const queuePanel = <div className={styles.queueList}>{queue.length === 0 ? <p className={styles.empty}>{translations.work.queue.empty}</p> : queue.map(pr => {
    const character = getCharacter(pr.authorId);
    return <button key={pr.id} type="button" className={pr.id === currentPR?.id ? styles.activeQueue : ''} aria-pressed={pr.id === currentPR?.id} disabled={Boolean(outgoing)} onClick={() => { selectPR(pr.id); setPanel(null); }}>
      <CharacterAvatar characterId={pr.authorId} name={pr.author} size={34} />
      <span><strong>{pr.title}</strong><small>{pr.author}{character ? ` · ${character.role[locale]}` : ''}</small></span>
      <em data-priority={pr.importance}>{translations.shared.importance[pr.importance]}</em>
    </button>;
  })}</div>;
  const clockProgress = Math.min(100, (currentTime / 480) * 100);
  const meterKeys = Object.keys(meters) as (keyof MeterSet)[];
  const mantra = currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback;
  const quote = dayQuote.text[locale] ?? dayQuote.text.en;
  const branch = displayPR ? `feat/${displayPR.templateId.replace(/^pr-\d+-/, '')} → main` : '';

  return <div className={styles.shell}>
    <header className={styles.topbar}><Link className={styles.brand} href="/"><span>↳</span>approve<strong>please</strong><b>.</b></Link><div className={styles.topActions}><button type="button" aria-label={translations.audio.button} onClick={() => setPanel('audio')}>♫ <span>{translations.audio.button}</span></button><button type="button" aria-label={t.rules} onClick={() => setPanel('rules')}>⌘ <span>{t.rules}</span></button><button type="button" onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}>{locale.toUpperCase()} ↔</button></div></header>
    <section className={styles.shiftbar} aria-label={t.clock}><div className={styles.clock}><span>{t.shift(currentDay)}</span><strong>{minutesToClock(currentTime)} <small>/ 17:00</small></strong><i><b style={{ width: `${clockProgress}%` }} /></i></div><div className={styles.meters}>{meterKeys.map(key => <div key={key}><span>{t[key]} <strong>{Math.round(meters[key])}<small>/100</small></strong></span><i><b style={{ width: `${meters[key]}%` }} /></i></div>)}</div><div className={styles.shiftNote}><strong>{mantra}</strong><span>{simulationPaused ? t.paused : `${counters.prsApproved + counters.prsRejected} ${t.reviewCount}`}</span></div></section>
    <div className={styles.workspace}><aside className={styles.sidebar}><div><h1>{t.queue}</h1><p>{translations.shared.queueAwaiting(queue.length)}</p></div>{queuePanel}<section className={styles.handbook}><span>⌘</span><h2>{t.rulesIntro}</h2><p>{t.liveRules}</p><button type="button" onClick={() => setPanel('rules')}>{t.rules} ↗</button></section></aside>
      {displayPR ? <ReviewDesk pullRequest={displayPR} repository={t.repository} number={reviewNumber(displayPR.templateId)} branch={branch} authorRole={displayCharacter?.role[locale]} expression={expression} selected={displaySelected} onToggle={toggleLine} onClear={() => setSelected([])} onVerdict={decide} disabled={simulationPaused} swipe={outgoing?.verdict ?? null} queueCount={queue.length} onOpenQueue={() => setPanel('queue')} onOpenRules={() => setPanel('rules')} labels={t} importanceLabels={translations.shared.importance} status={status} />
        : <main className={styles.emptyDesk}><span>↳</span><h1>{translations.work.queue.empty}</h1><p>{translations.work.queue.hint}</p></main>}
    </div>
    <PRArrivalNotice notice={arrivalNotice} />
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="live-panel-title" onCancel={event => { event.preventDefault(); setPanel(null); }} onClick={event => { if (event.target === dialog.current) setPanel(null); }}><div className={styles.dialogTop}><h2 id="live-panel-title">{panel === 'queue' ? t.queue : panel === 'audio' ? translations.audio.title : t.handbookTitle}</h2><button type="button" onClick={() => setPanel(null)} aria-label={t.close}>×</button></div>{panel === 'queue' ? queuePanel : panel === 'audio' ? <AudioControls audio={audio} /> : <div className={styles.rules}><span>⌘</span><h3>{t.rulesIntro}</h3><p>{t.rulesBody}</p><p>{t.emptySelection}</p><blockquote>“{quote}”<footer>— {dayQuote.speaker}</footer></blockquote><small>{t.rulesNote}</small></div>}</dialog>
  </div>;
};

export default WorkScreen;
