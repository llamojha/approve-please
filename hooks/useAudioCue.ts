import { useCallback, useEffect, useRef, useState } from 'react';
import type { MeterSet } from '../types';
import { AdaptiveAudio, type AudioStatus } from '../utils/adaptiveAudio';
import { readAudioPreferences, writeAudioPreferences } from '../utils/audioPreferences';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const initialStatus: AudioStatus = {
  musicEnabled: false, notificationsEnabled: false, volume: 0.25, supported: true, error: null, tempo: 72
};

export const useAudioCue = (meters?: MeterSet) => {
  const engineRef = useRef<AdaptiveAudio | null>(null);
  const preferencesRef = useRef(readAudioPreferences(typeof window === 'undefined' ? { getItem: () => null } : window.localStorage));
  const [status, setStatus] = useState<AudioStatus>(initialStatus);

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const engine = new AdaptiveAudio(AudioCtx ? () => new AudioCtx() : null, setStatus);
    engineRef.current = engine;
    engine.setVolume(preferencesRef.current.volume);
    setStatus(engine.getStatus());
    const visibilityChanged = () => { void engine.setHidden(document.hidden); };
    visibilityChanged();
    document.addEventListener('visibilitychange', visibilityChanged);
    const restore = () => {
      const preferences = preferencesRef.current;
      void engine.setMusicEnabled(preferences.musicEnabled);
      void engine.setNotificationsEnabled(preferences.notificationsEnabled);
      window.removeEventListener('pointerdown', restore);
      window.removeEventListener('keydown', restore);
    };
    window.addEventListener('pointerdown', restore, { once: true });
    window.addEventListener('keydown', restore, { once: true });
    return () => {
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pointerdown', restore);
      window.removeEventListener('keydown', restore);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const { stability, velocity, satisfaction } = meters ?? {};
  useEffect(() => {
    engineRef.current?.setMeters(
      stability === undefined || velocity === undefined || satisfaction === undefined
        ? undefined
        : { stability, velocity, satisfaction }
    );
  }, [stability, velocity, satisfaction]);

  const persist = useCallback((patch: Partial<typeof preferencesRef.current>) => {
    preferencesRef.current = { ...preferencesRef.current, ...patch };
    writeAudioPreferences(window.localStorage, preferencesRef.current);
  }, []);
  const setMusicEnabled = useCallback(async (enabled: boolean) => { persist({ musicEnabled: enabled }); await engineRef.current?.setMusicEnabled(enabled); }, [persist]);
  const setNotificationsEnabled = useCallback(async (enabled: boolean) => { persist({ notificationsEnabled: enabled }); await engineRef.current?.setNotificationsEnabled(enabled); }, [persist]);
  const setVolume = useCallback((volume: number) => { persist({ volume }); engineRef.current?.setVolume(volume); }, [persist]);
  const playCue = useCallback((frequency = 660, duration = 0.15) => { engineRef.current?.playCue(frequency, duration); }, []);
  const playArrivalCue = useCallback(() => { engineRef.current?.playArrivalCue(); }, []);

  return { ...status, setMusicEnabled, setNotificationsEnabled, setVolume, playCue, playArrivalCue };
};
