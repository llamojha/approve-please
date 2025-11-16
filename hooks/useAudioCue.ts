import { useCallback, useRef } from 'react';

type AudioContextConstructor = typeof AudioContext;

declare global {
  interface Window {
    webkitAudioContext?: AudioContextConstructor;
  }
}

export const useAudioCue = () => {
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!contextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      contextRef.current = new AudioCtx();
    }
    return contextRef.current;
  };

  const playCue = useCallback((frequency = 660, duration = 0.15) => {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.001;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, []);

  return { playCue };
};
