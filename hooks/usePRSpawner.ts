import { useCallback, useEffect, useRef } from "react";
import { useGameState } from "../context/GameContext";
import { prTemplates, PullRequestTemplate } from "../data/prs";
import { PullRequest, LanguagePreference, ScriptedWave } from "../types";
import { instantiatePullRequest } from "../utils/pr";
import { getCodeLanguages } from "../utils/language";
import { useLocale } from "../context/LocaleContext";

const templateMap = new Map(
  prTemplates.map((template) => [template.templateId, template])
);
const DEFAULT_WAVE_MINUTES = [0, 60, 180, 360];
const WEIGHTED_WAVE_COUNTS = [
  1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 5,
];

const pickWeightedWaveCount = (): number => {
  const index = Math.floor(Math.random() * WEIGHTED_WAVE_COUNTS.length);
  return WEIGHTED_WAVE_COUNTS[index];
};

interface WaveTracker {
  waves: Set<number>;
  scripted: Set<string>;
}

const waveTrackerStore = new Map<number, WaveTracker>();
const tutorialWaves: Record<number, ScriptedWave[]> = {
  1: [
    {
      atMinute: 0,
      templateIds: [
        "pr-000-onboarding-readme-update",
        "pr-001-sanitize-readme-api-key",
      ],
      note: "Tutorial PRs: clean README approval, then reject exposed API key.",
    },
  ],
};

const getScriptedWavesForDay = (day: number): ScriptedWave[] => {
  return tutorialWaves[day] ?? [];
};

const templateMatchesPreference = (
  template: PullRequestTemplate,
  preference: LanguagePreference
): boolean => {
  const languages = getCodeLanguages(template.files);
  const isGeneric = languages.length === 0;
  if (preference.length === 0) {
    return true;
  }
  if (isGeneric) {
    return preference.includes("generic");
  }
  return languages.some((language) => preference.includes(language));
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
    state: {
      phase,
      currentTime,
      currentDay,
      queue,
      currentPR,
      languagePreference,
    },
    actions: { enqueuePRs },
  } = useGameState();
  const { locale } = useLocale();

  const trackerRef = useRef<WaveTracker>(getWaveTracker(currentDay));
  const workingPoolRef = useRef<PullRequestTemplate[]>([]);
  const basePoolRef = useRef<PullRequestTemplate[]>([]);
  const spawnCountRef = useRef(0);
  const trackerResetKeyRef = useRef<string>("");
  const lastHourlyCheckRef = useRef<number>(-1);

  const drawBatch = useCallback(
    (count: number, day: number): PullRequest[] => {
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
        const pr = instantiatePullRequest(
          template,
          day,
          spawnCountRef.current,
          locale
        );
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[Spawner] Drew PR",
            pr.id,
            "from template",
            pr.templateId
          );
        }
        results.push(pr);
      }
      return results;
    },
    [locale]
  );

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
        const pr = instantiatePullRequest(
          template,
          day,
          spawnCountRef.current,
          locale
        );
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[Spawner] Scripted PR",
            pr.id,
            "from template",
            pr.templateId
          );
        }
        results.push(pr);
      });
      return results;
    },
    [languagePreference, locale]
  );

  useEffect(() => {
    const basePool = prTemplates.filter((template) =>
      templateMatchesPreference(template, languagePreference)
    );

    basePoolRef.current = basePool;
    workingPoolRef.current = shuffle(basePool);
    spawnCountRef.current = 0;
    lastHourlyCheckRef.current = -1;
  }, [currentDay, languagePreference]);

  useEffect(() => {
    const key = `${currentDay}`;
    if (trackerResetKeyRef.current === key) {
      return;
    }
    trackerResetKeyRef.current = key;
    trackerRef.current = resetWaveTracker(currentDay);
  }, [currentDay]);

  useEffect(() => {
    if (phase !== "WORK") {
      return;
    }

    const scriptedWaves = getScriptedWavesForDay(currentDay);
    const triggeredWaves = trackerRef.current.waves;
    const triggeredScripted = trackerRef.current.scripted;
    const shouldSkipDefaultWave = (minute: number): boolean => {
      return scriptedWaves.some((wave) => wave.atMinute === minute);
    };

    DEFAULT_WAVE_MINUTES.forEach((minute) => {
      if (currentTime >= minute && !triggeredWaves.has(minute)) {
        triggeredWaves.add(minute);
        if (shouldSkipDefaultWave(minute)) {
          return;
        }
        const count = minute === 0 ? 2 : pickWeightedWaveCount();
        const prs = drawBatch(count, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    });

    scriptedWaves.forEach((wave, index) => {
      const key = `${wave.atMinute}-${index}`;
      if (currentTime >= wave.atMinute && !triggeredScripted.has(key)) {
        triggeredScripted.add(key);
        const prs = spawnSpecific(wave.templateIds, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    });

    const currentHour = Math.floor(currentTime / 60);
    const withinHourlyWindow = currentHour >= 1 && currentHour <= 7;
    if (withinHourlyWindow && currentHour !== lastHourlyCheckRef.current) {
      lastHourlyCheckRef.current = currentHour;
      const totalQueue = queue.length + (currentPR ? 1 : 0);
      if (totalQueue === 0) {
        const prs = drawBatch(1, currentDay);
        if (prs.length > 0) {
          enqueuePRs(prs);
        }
      }
    }
  }, [
    phase,
    currentTime,
    currentDay,
    enqueuePRs,
    queue,
    currentPR,
    spawnSpecific,
    drawBatch,
  ]);
};

const shuffle = (templates: PullRequestTemplate[]): PullRequestTemplate[] => {
  const copy = [...templates];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
