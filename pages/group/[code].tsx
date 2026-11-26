import { useState } from 'react';
import { useRouter } from 'next/router';
import { GroupShell } from '../../components/group/GroupShell';
import { GroupPlay } from '../../components/group/GroupPlay';
import { GroupResults } from '../../components/group/GroupResults';
import { GroupClock } from '../../components/group/GroupClock';
import { useGroupSession } from '../../hooks/useGroupSession';
import { useLocale } from '../../context/LocaleContext';
import { groupErrorMessage } from '../../constants/groupCopy';
import { useTranslations } from '../../hooks/useTranslations';
import styles from '../../styles/GroupSessions.module.css';

export default function GroupRoomPage() {
  const router=useRouter();
  const code=typeof router.query.code==='string'?router.query.code.toUpperCase():'';
  const {room,error,connectionError,busy,command,refresh}=useGroupSession(code);
  const {locale}=useLocale();const t=useTranslations().group;
  const [name,setName]=useState('');const [copied,setCopied]=useState(false);
  const [confirming,setConfirming]=useState(false);
  const copy=async()=>{try {await navigator.clipboard.writeText(window.location.href);setCopied(true);} catch {setCopied(false);}};
  return <GroupShell>
    {error && <div className={styles.notice} role="alert">{groupErrorMessage(locale,error)} {connectionError && room && t.reconnect} <button type="button" onClick={()=>void refresh()}>{t.retry}</button></div>}
    {!room ? <main className={styles.page}><h1>{t.loading}</h1></main> : room.phase==='finished' ? <GroupResults room={room} /> : room.phase==='playing' && room.me && room.me.reviewedIds.length<room.total ?
      <GroupPlay room={room} busy={busy} connected={!connectionError} onReview={command} /> : <main className={styles.page}>
        <header className={styles.hero}><p className={styles.eyebrow}>{room.role==='host'?t.host:t.eyebrow}</p><h1>{room.phase==='lobby'?t.lobby:room.me?t.done:t.progress}</h1><p>{room.phase==='lobby'?t.lobbyBody:room.me?t.doneBody:t.share}</p></header>
        <div className={styles.roomBanner}><div><span>{t.room}</span><strong>{room.code}</strong></div><button type="button" onClick={()=>void copy()}>{t.copy}</button><span role="status">{copied?t.copied:''}</span>{room.phase==='playing' && <div className={styles.waitingClock}><GroupClock room={room} label={t.countdown} /></div>}</div>
        {room.role==='visitor' && <form className={styles.card} onSubmit={event=>{event.preventDefault();void command({action:'join',name});}}><h2>{t.join}</h2><label htmlFor="group-name">{t.name}</label><input id="group-name" autoComplete="nickname" value={name} onChange={event=>setName(event.target.value)} required minLength={1} maxLength={32} /><button disabled={busy} className={styles.primary}>{t.enter} ↗</button></form>}
        <section className={styles.card}><h2>{t.players} <span className={styles.count}>{room.players.length}/40</span></h2>
          {!room.players.length && <p className={styles.muted}>{t.empty}</p>}
          <ul className={styles.roster}>{room.players.map(player=><li key={player.id} data-playing={room.phase==='playing'}><span className={styles.seat} aria-hidden="true">{player.name.slice(0,1).toUpperCase()}</span><strong>{player.name}</strong><span>{room.phase==='lobby'?t.ready:`${player.reviewed}/${room.total} ${t.reviewed} · ${player.finished?t.completed:t.playing}`}</span></li>)}</ul>
          {room.role==='host' && room.phase==='lobby' ? <button className={styles.primary} disabled={busy||!room.players.length} onClick={()=>void command({action:'start'})}>{t.start} →</button> : room.phase==='lobby' && room.me ? <p className={styles.muted} role="status">{t.joined} {t.waiting}</p> : null}
          {room.role==='host' && room.phase==='playing' && (confirming ? <div className={styles.confirm}><p>{t.confirmFinish}</p><button disabled={busy} onClick={()=>void command({action:'finish'})}>{t.finish}</button><button onClick={()=>setConfirming(false)}>{t.close}</button></div> : <button type="button" onClick={()=>setConfirming(true)}>{t.finish}</button>)}
        </section>
        <p className={styles.muted}>{t.mode}</p>
      </main>}
  </GroupShell>;
}
