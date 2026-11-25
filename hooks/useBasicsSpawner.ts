import { useEffect } from 'react';
import { useGameState } from '../context/GameContext';
import { useLocale } from '../context/LocaleContext';
import { BASICS_WAVES, basicsDay, makeBasicsPR } from '../utils/basicsGame';

export const useBasicsSpawner = () => {
  const { state, actions: { deliverPRs } } = useGameState();
  const { locale } = useLocale();
  const { contentTrack, phase, simulationPaused, currentDay, currentTime, runId, deliveryMarkers } = state;
  useEffect(() => {
    if (contentTrack !== 'basics' || phase !== 'WORK' || simulationPaused) return;
    const day = basicsDay(currentDay);
    if (!day) return;
    for (const wave of BASICS_WAVES) {
      const marker = `basics:${currentDay}:${wave.minute}`;
      if (currentTime < wave.minute || deliveryMarkers.includes(marker)) continue;
      deliverPRs(marker, day.exercises.slice(wave.start, wave.end).map((exercise,index) =>
        makeBasicsPR(exercise,currentDay,runId,locale,wave.start + index)));
    }
  }, [contentTrack, phase, simulationPaused, currentDay, currentTime, runId, deliveryMarkers, deliverPRs, locale]);
};
