import { useId } from 'react';
import type { useAudioCue } from '../../hooks/useAudioCue';
import { useTranslations } from '../../hooks/useTranslations';
import styles from '../../styles/AudioControls.module.css';

export default function AudioControls({ audio }: { audio: ReturnType<typeof useAudioCue> }) {
  const t = useTranslations().audio;
  const volumeId = useId();
  return <div className={styles.controls}>
    <p className={styles.description}>{t.description}</p>
    <label className={styles.toggle}>
      <input type="checkbox" checked={audio.musicEnabled} disabled={!audio.supported}
        onChange={event => { void audio.setMusicEnabled(event.currentTarget.checked); }} />
      <span>{t.music}</span>
    </label>
    <label className={styles.toggle}>
      <input type="checkbox" checked={audio.notificationsEnabled} disabled={!audio.supported}
        onChange={event => { void audio.setNotificationsEnabled(event.currentTarget.checked); }} />
      <span>{t.notifications}</span>
    </label>
    <label className={styles.volumeLabel} htmlFor={volumeId}>{t.volume}<output>{Math.round(audio.volume * 100)}%</output></label>
    <input id={volumeId} className={styles.volume} type="range" min="0" max="100" step="5"
      value={Math.round(audio.volume * 100)} disabled={!audio.supported}
      onChange={event => audio.setVolume(Number(event.currentTarget.value) / 100)} />
    <button className={styles.test} type="button" disabled={!audio.supported || !audio.notificationsEnabled} onClick={audio.playArrivalCue}>{t.test}</button>
    {!audio.supported ? <p role="status">{t.unavailable}</p> : audio.error ? <p role="alert">{t.error}</p> :
      audio.musicEnabled ? <p className={styles.status}>{t.tempo(audio.tempo)}</p> :
      !audio.notificationsEnabled ? <p className={styles.status}>{t.off}</p> : null}
  </div>;
}
