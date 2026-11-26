import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { GroupShell } from '../components/group/GroupShell';
import { useLocale } from '../context/LocaleContext';
import { groupErrorMessage } from '../constants/groupCopy';
import { useTranslations } from '../hooks/useTranslations';
import { roomRequest } from '../hooks/useGroupSession';
import type { ContentTrack } from '../types';
import type { GroupSettings } from '../types/groupSessions';
import styles from '../styles/GroupSessions.module.css';

export default function GroupEntry() {
  const {locale}=useLocale();
  const t=useTranslations().group;
  const router=useRouter();
  const [track,setTrack]=useState<ContentTrack>('basics');
  const [day,setDay]=useState(1);
  const [duration,setDuration]=useState<GroupSettings['durationSeconds']>(300);
  const [code,setCode]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const create=async(event:FormEvent)=>{
    event.preventDefault();if (busy) return;setBusy(true);setError('');
    try {const room=await roomRequest('/api/group-sessions',{track,day,locale,durationSeconds:duration});await router.push(`/group/${room.code}`);}
    catch(cause) {setError(cause instanceof Error?cause.message:'session_error');}
    finally {setBusy(false);}
  };
  const join=(event:FormEvent)=>{event.preventDefault();const value=code.trim().toUpperCase();if (!/^[A-HJ-NP-Z2-9]{6}$/.test(value)) {setError('invalid_code');return;}void router.push(`/group/${value}`);};
  return <GroupShell><main className={styles.page}>
    <header className={styles.hero}><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></header>
    {error && <p className={styles.error} role="alert">{groupErrorMessage(locale,error)}</p>}
    <div className={styles.forms}>
      <form onSubmit={create} className={styles.card}><span className={styles.symbol} aria-hidden="true">⌘</span><h2>{t.create}</h2>
        <label htmlFor="group-track">{t.track}</label><select id="group-track" value={track} onChange={event=>setTrack(event.target.value as ContentTrack)}><option value="basics">{t.basics}</option><option value="code">{t.codeTrack}</option></select>
        {track==='basics' && <><label htmlFor="group-day">{t.day}</label><select id="group-day" value={day} onChange={event=>setDay(Number(event.target.value))}>{[1,2,3,4,5,6].map(value=><option key={value} value={value}>{value}</option>)}</select></>}
        <label htmlFor="group-duration">{t.duration}</label><select id="group-duration" value={duration} onChange={event=>setDuration(Number(event.target.value) as GroupSettings['durationSeconds'])}>{[120,300,600].map(value=><option key={value} value={value}>{value/60} {t.minutes}</option>)}</select>
        <p className={styles.muted}>{t.contentLanguage}</p><p className={styles.muted}>{t.mode}</p><button className={styles.primary} disabled={busy}>{t.create} ↗</button>
      </form>
      <form onSubmit={join} className={styles.card}><span className={styles.symbol} aria-hidden="true">↳</span><h2>{t.join}</h2><label htmlFor="group-code">{t.code}</label><input id="group-code" value={code} onChange={event=>setCode(event.target.value.toUpperCase())} maxLength={6} autoCapitalize="characters" autoComplete="off" placeholder="ABC234" required className={styles.codeInput} /><p className={styles.muted}>{t.share}</p><button className={styles.primary}>{t.join} ↗</button></form>
    </div>
  </main></GroupShell>;
}
