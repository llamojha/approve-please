import { useCallback, useEffect, useRef, useState } from 'react';
import type { MeterSet } from '../types';
import { AdaptiveAudio, type AudioStatus } from '../utils/adaptiveAudio';

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
  const [status, setStatus] = useState<AudioStatus>(initialStatus);

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const engine = new AdaptiveAudio(AudioCtx ? () => new AudioCtx() : null, setStatus);
    engineRef.current = engine;
    setStatus(engine.getStatus());
    const visibilityChanged = () => { void engine.setHidden(document.hidden); };
    visibilityChanged();
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
      document.removeEventListener('visibilitychange', visibilityChanged);
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

  const setMusicEnabled = useCallback(async (enabled: boolean) => { await engineRef.current?.setMusicEnabled(enabled); }, []);
  const setNotificationsEnabled = useCallback(async (enabled: boolean) => { await engineRef.current?.setNotificationsEnabled(enabled); }, []);
  const setVolume = useCallback((volume: number) => { engineRef.current?.setVolume(volume); }, []);
  const playCue = useCallback((frequency = 660, duration = 0.15) => { engineRef.current?.playCue(frequency, duration); }, []);
  const playArrivalCue = useCallback(() => { engineRef.current?.playArrivalCue(); }, []);

  return { ...status, setMusicEnabled, setNotificationsEnabled, setVolume, playCue, playArrivalCue };
};
