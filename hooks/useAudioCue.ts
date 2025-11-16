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

  const playArrivalCue = useCallback(() => {
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const now = ctx.currentTime;
    const sweep = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(260, now);
    sweep.frequency.exponentialRampToValueAtTime(520, now + 0.32);

    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1120, now);
    shimmer.frequency.exponentialRampToValueAtTime(760, now + 0.32);

    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 4;

    gainNode.gain.value = 0.001;

    sweep.connect(filter);
    shimmer.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    sweep.start(now);
    shimmer.start(now + 0.03);
    sweep.stop(now + 0.55);
    shimmer.stop(now + 0.45);
  }, []);

  return { playCue, playArrivalCue };
};
