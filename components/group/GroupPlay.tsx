import { useCallback, useEffect, useRef, useState } from 'react';
import ReviewDesk from '../work/ReviewDesk';
import CharacterAvatar from '../common/CharacterAvatar';
import AudioControls from '../common/AudioControls';
import { useAudioCue } from '../../hooks/useAudioCue';
import { useLocale } from '../../context/LocaleContext';
import { getCharacter } from '../../data/characters';
import { useTranslations } from '../../hooks/useTranslations';
import { minutesToClock } from '../../utils/helpers';
import { useGroupCountdown } from './GroupClock';
import type { GroupCommand, GroupSnapshot } from '../../types/groupSessions';
import type { LineReference, MeterSet, PullRequest } from '../../types';
import type { ReviewVerdict } from '../../utils/decision';
import live from '../../styles/LiveDesk.module.css';
import styles from '../../styles/GroupSessions.module.css';

interface Props { room:GroupSnapshot; busy:boolean; connected:boolean; onReview:(command:GroupCommand)=>Promise<boolean> }
export function GroupPlay({room,busy,connected,onReview}:Props) {
  const {locale}=useLocale();const translations=useTranslations();const t=translations.group;const labels=translations.designStudy;
  const [id,setId]=useState<string|null>(null);
  const pr=room.queue.find(item=>item.id===id) ?? room.queue[0];
  const [selected,setSelected]=useState<LineReference[]>([]);
  const [outgoing,setOutgoing]=useState<{pr:PullRequest;verdict:ReviewVerdict;selected:LineReference[]}|null>(null);
  const [panel,setPanel]=useState<'queue'|'guide'|'audio'|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);const locked=useRef(false);
  const remaining=useGroupCountdown(room);
  const audio=useAudioCue(room.me!.meters);
  const previousFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>setSelected([]),[pr?.id]);
  useEffect(()=>{
    if (panel) { previousFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal(); }
    else {dialog.current?.close();previousFocus.current?.focus();}
  },[panel]);
  useEffect(()=>{
    if (!outgoing) return;
    const timer=window.setTimeout(()=>{setOutgoing(null);locked.current=false;window.requestAnimationFrame(()=>document.querySelector<HTMLElement>('[data-review-action="approve"]:not(:disabled)')?.focus());},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);
    return ()=>window.clearTimeout(timer);
  },[outgoing]);
  const decide=useCallback(async(verdict:ReviewVerdict)=>{
    if (!pr || locked.current || busy || !connected || remaining<=0 || panel) return;
    locked.current=true;
    const accepted=await onReview({action:'review',prId:pr.id,verdict,selectedRefs:selected});
    if (accepted) {setOutgoing({pr,verdict,selected});audio.playCue(verdict==='approve'?520:360,.1);}
    else locked.current=false;
  },[pr,busy,connected,remaining,panel,onReview,selected,audio]);
  useEffect(()=>{
    const listener=(event:KeyboardEvent)=>{
      if (event.repeat || event.defaultPrevented || !event.altKey || event.ctrlKey || event.metaKey ||
        (event.target as HTMLElement|null)?.matches('input,textarea,select,[contenteditable="true"]')) return;
      if (event.key.toLowerCase()==='a') {event.preventDefault();void decide('approve');}
      if (event.key.toLowerCase()==='r') {event.preventDefault();void decide('request-changes');}
    };
    window.addEventListener('keydown',listener);return ()=>window.removeEventListener('keydown',listener);
  },[decide]);
  const queue=<div className={live.queueList}>{room.queue.map(item=><button key={item.id} type="button" aria-pressed={item.id===pr?.id} className={item.id===pr?.id?live.activeQueue:''} disabled={busy||Boolean(outgoing)} onClick={()=>{setId(item.id);setPanel(null);}}><CharacterAvatar characterId={item.authorId} name={item.author} size={34} /><span><strong>{item.title}</strong><small>{item.author}</small></span><em data-priority={item.importance}>{translations.shared.importance[item.importance]}</em></button>)}</div>;
  const display=outgoing?.pr??pr;
  const seconds=Math.ceil(remaining/1000);
  const elapsed=1-remaining/(room.settings.durationSeconds*1000);
  return <>
    <section className={live.shiftbar} aria-label={t.countdown}>
      <div className={live.clock}><span>{t.room} {room.code}</span><strong>{minutesToClock(Math.floor(Math.min(1,elapsed)*480))} <small>· {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</small></strong><i><b style={{width:`${Math.min(100,elapsed*100)}%`}} /></i></div>
      <div className={live.meters}>{(Object.keys(room.me!.meters) as (keyof MeterSet)[]).map(key=><div key={key}><span>{labels[key]}<strong>{Math.round(room.me!.meters[key])}<small>/100</small></strong></span><i><b style={{width:`${room.me!.meters[key]}%`}} /></i></div>)}</div>
      <div className={live.shiftNote}><strong>{room.me!.name}</strong><span>{room.me!.reviewedIds.length}/{room.total} {t.reviewed}</span></div>
    </section>
    <div className={live.workspace}>
      <aside className={live.sidebar}><div><h1>{labels.queue}</h1><p>{room.queue.length} · {t.share}</p></div>{queue}<section className={live.handbook}><h2>{t.guide}</h2><p>{t.mode}</p><button type="button" onClick={()=>setPanel('guide')}>{labels.rules} ↗</button><button type="button" onClick={()=>setPanel('audio')}>♫ {t.sound}</button></section></aside>
      {display && <ReviewDesk pullRequest={display} repository={room.settings.track==='basics'?'mergeworks / team-notes':labels.repository} number={1000+([...display.templateId].reduce((hash,letter)=>(hash*33+letter.charCodeAt(0))>>>0,0)%9000)} branch={`feat/${display.templateId} → main`} authorRole={getCharacter(display.authorId)?.role[locale]} selected={outgoing?.selected??selected}
        onToggle={ref=>{if (!locked.current) setSelected(previous=>previous.some(item=>item.filename===ref.filename&&item.rowId===ref.rowId)?previous.filter(item=>item.filename!==ref.filename||item.rowId!==ref.rowId):[...previous,ref]);}}
        onClear={()=>setSelected([])} onVerdict={verdict=>void decide(verdict)} disabled={busy||!connected||remaining<=0} swipe={outgoing?.verdict} queueCount={room.queue.length} onOpenQueue={()=>setPanel('queue')} onOpenRules={()=>setPanel('guide')} labels={labels} importanceLabels={translations.shared.importance} status={busy?t.submitting:room.me!.reviewedIds.length?t.saved:''}>
        <p className={styles.groupStatus}>{t.share} · <button type="button" onClick={()=>setPanel('audio')}>♫ {t.sound}</button></p>
      </ReviewDesk>}
    </div>
    <dialog ref={dialog} className={live.dialog} aria-labelledby="group-panel-title" onCancel={event=>{event.preventDefault();setPanel(null);}}><div className={live.dialogTop}><h2 id="group-panel-title">{panel==='queue'?labels.queue:panel==='audio'?t.sound:t.guide}</h2><button type="button" aria-label={t.close} onClick={()=>setPanel(null)}>×</button></div>{panel==='queue'?queue:panel==='audio'?<div className={styles.audioPanel}><AudioControls audio={audio} /></div>:<div className={live.rules}><p>{t.guideBody}</p></div>}</dialog>
  </>;
}
