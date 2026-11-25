import { useEffect } from 'react';
import { useGameState } from '../context/GameContext';
import { useLocale } from '../context/LocaleContext';
import { basicsDay, basicsWaveMarker, makeBasicsPR, pendingBasicsWaves } from '../utils/basicsGame';

export const useBasicsSpawner = () => {
  const { state, actions: { deliverPRs } } = useGameState();
  const { locale } = useLocale();
  const { contentTrack, phase, simulationPaused, currentDay, currentTime, runId, deliveryMarkers, queue } = state;
  useEffect(() => {
    if (contentTrack !== 'basics' || phase !== 'WORK' || simulationPaused) return;
    const day = basicsDay(currentDay);
    if (!day) return;
    for (const wave of pendingBasicsWaves(currentDay,currentTime,deliveryMarkers,queue.length === 0)) {
      deliverPRs(basicsWaveMarker(currentDay,wave), day.exercises.slice(wave.start, wave.end).map((exercise,index) =>
        makeBasicsPR(exercise,currentDay,runId,locale,wave.start + index)));
    }
  }, [contentTrack, phase, simulationPaused, currentDay, currentTime, runId, deliveryMarkers, queue.length, deliverPRs, locale]);
};
