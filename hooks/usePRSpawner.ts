import { useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../context/GameContext';
import { prTemplates, PullRequestTemplate } from '../data/prs';
import { PullRequest, LanguagePreference } from '../types';
import { instantiatePullRequest } from '../utils/pr';
import { getCodeLanguages } from '../utils/language';

const templateMap = new Map(prTemplates.map((template) => [template.templateId, template]));

interface WaveTracker {
  waves: Set<number>;
  scripted: Set<string>;
}

const waveTrackerStore = new Map<number, WaveTracker>();

const templateMatchesPreference = (
  template: PullRequestTemplate,
  preference: LanguagePreference
): boolean => {
  const languages = getCodeLanguages(template.files);
  const isGeneric = languages.length === 0;
  if (isGeneric) {
    return true;
  }
  if (preference === 'any') {
    return true;
  }
  return languages.includes(preference);
};

const getWaveTracker = (day: number): WaveTracker => {
  const existing = waveTrackerStore.get(day);
  if (existing) {
    return existing;
  }
  const tracker: WaveTracker = { waves: new Set(), scripted: new Set() };
  waveTrackerStore.set(day, tracker);
  return tracker;
};

const resetWaveTracker = (day: number): WaveTracker => {
  const tracker: WaveTracker = { waves: new Set(), scripted: new Set() };
  waveTrackerStore.set(day, tracker);
  return tracker;
};

export const usePRSpawner = () => {
  const {
    state: { phase, currentTime, currentDay, activeConfig, queue, currentPR, languagePreference },
    actions: { enqueuePRs }
  } = useGameState();

  const trackerRef = useRef<WaveTracker>(getWaveTracker(currentDay));
  const workingPoolRef = useRef<PullRequestTemplate[]>([]);
  const basePoolRef = useRef<PullRequestTemplate[]>([]);
  const spawnCountRef = useRef(0);
  const lastDynamicSpawnMinuteRef = useRef<number>(-Infinity);
  const trackerResetKeyRef = useRef<string>('');
  const lastHourlyCheckRef = useRef<number>(-1);

  const drawBatch = (count: number, day: number): PullRequest[] => {
    const results: PullRequest[] = [];
    for (let i = 0; i < count; i += 1) {
      if (workingPoolRef.current.length === 0) {
        workingPoolRef.current = shuffle(basePoolRef.current);
      }
      const template = workingPoolRef.current.shift();
      if (!template) {
        break;
      }
      spawnCountRef.current += 1;
      const pr = instantiatePullRequest(template, day, spawnCountRef.current);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Spawner] Drew PR', pr.id, 'from template', pr.templateId);
      }
      results.push(pr);
    }
    return results;
  };

  const spawnSpecific = useCallback(
    (templateIds: string[], day: number): PullRequest[] => {
      const results: PullRequest[] = [];
      templateIds.forEach((templateId) => {
        const template = templateMap.get(templateId);
        if (!template) {
          return;
        }
        if (!templateMatchesPreference(template, languagePreference)) {
          return;
        }
        spawnCountRef.current += 1;
        const pr = instantiatePullRequest(template, day, spawnCountRef.current);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Spawner] Scripted PR', pr.id, 'from template', pr.templateId);
        }
        results.push(pr);
      });
      return results;
    },
    [languagePreference]
  );

  useEffect(() => {
    const basePool = prTemplates.filter((template) =>
      templateMatchesPreference(template, languagePreference)
    );

    basePoolRef.current = basePool;
    workingPoolRef.current = shuffle(basePool);
    spawnCountRef.current = 0;
    lastDynamicSpawnMinuteRef.current = -Infinity;
    lastHourlyCheckRef.current = -1;
  }, [activeConfig, currentDay, languagePreference]);

  useEffect(() => {
    const key = `${currentDay}-${activeConfig.codename}`;
    if (trackerResetKeyRef.current === key) {
      return;
    }
    trackerResetKeyRef.current = key;
    trackerRef.current = resetWaveTracker(currentDay);
  }, [currentDay, activeConfig]);

  useEffect(() => {
    if (phase !== 'WORK') {
      return;
    }

    const pending = activeConfig.spawn.waves;
    const triggeredWaves = trackerRef.current.waves;
    const triggeredScripted = trackerRef.current.scripted;
    pending.forEach((wave) => {
      if (currentTime >= wave.atMinute && !triggeredWaves.has(wave.atMinute)) {
        triggeredWaves.add(wave.atMinute);
        const prs = drawBatch(wave.count, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    });

    activeConfig.spawn.scriptedWaves?.forEach((wave, index) => {
      const key = `${wave.atMinute}-${index}`;
      if (currentTime >= wave.atMinute && !triggeredScripted.has(key)) {
        triggeredScripted.add(key);
        const prs = spawnSpecific(wave.templateIds, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    });

    const targetQueueSeconds = activeConfig.spawn.targetQueueSeconds;
    if (targetQueueSeconds) {
      const backlogSeconds =
        (currentPR?.estimatedReviewSeconds ?? 0) +
        queue.reduce((total, pr) => total + (pr.estimatedReviewSeconds ?? 0), 0);
      if (backlogSeconds < targetQueueSeconds) {
        const cadence = activeConfig.spawn.dynamicCadenceMinutes ?? 45;
        if (currentTime - lastDynamicSpawnMinuteRef.current >= cadence) {
          const prs = drawBatch(1, currentDay);
          if (prs.length > 0) {
            enqueuePRs(prs);
            lastDynamicSpawnMinuteRef.current = currentTime;
          }
        }
      }
    }

    if (currentDay > 1) {
      const currentHour = Math.floor(currentTime / 60);
      if (currentHour === lastHourlyCheckRef.current) {
        return;
      }
      lastHourlyCheckRef.current = currentHour;
      const totalQueue = queue.length + (currentPR ? 1 : 0);
      if (totalQueue === 0) {
        const prs = drawBatch(1, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    }
  }, [phase, currentTime, activeConfig, currentDay, enqueuePRs, queue, currentPR, spawnSpecific]);
};

const shuffle = (templates: PullRequestTemplate[]): PullRequestTemplate[] => {
  const copy = [...templates];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
