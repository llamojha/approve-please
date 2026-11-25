import { useEffect } from 'react';
import { MS_PER_GAME_MINUTE } from '../constants/game';
import { useGameState } from '../context/GameContext';

export const useGameClock = () => {
  const {
    state: { phase, simulationPaused, contentTrack, difficulty },
    actions: { tickWorkMinute }
  } = useGameState();

  useEffect(() => {
    if (phase !== 'WORK' || simulationPaused) {
      return;
    }
    const interval = setInterval(() => {
      tickWorkMinute();
    }, MS_PER_GAME_MINUTE * (contentTrack === 'basics' && difficulty === 'learning' ? 3 : 1));

    return () => {
      clearInterval(interval);
    };
  }, [phase, simulationPaused, tickWorkMinute, contentTrack, difficulty]);
};
