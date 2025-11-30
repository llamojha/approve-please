import { useEffect } from 'react';
import { MS_PER_GAME_MINUTE } from '../constants/game';
import { useGameState } from '../context/GameContext';

export const useGameClock = () => {
  const {
    state: { phase },
    actions: { tickWorkMinute },
    mode
  } = useGameState();

  useEffect(() => {
    if (phase !== 'WORK' || mode === 'tutorial') {
      return;
    }
    const interval = setInterval(() => {
      tickWorkMinute();
    }, MS_PER_GAME_MINUTE);

    return () => {
      clearInterval(interval);
    };
  }, [phase, mode, tickWorkMinute]);
};
