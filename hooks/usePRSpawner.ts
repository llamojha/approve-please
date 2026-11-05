import { useCallback, useEffect, useRef } from "react";
import { useGameState } from "../context/GameContext";
import {
  eagerTemplates,
  templateLoaders,
  PullRequestTemplate,
} from "../data/prs";
import { PullRequest, LanguagePreference, ScriptedWave } from "../types";
import { instantiatePullRequest } from "../utils/pr";
import { getCodeLanguages } from "../utils/language";
import { orderForLearning } from "../utils/curriculum"; // SPIKE(plan 010): learning-mode curriculum prototype
import { useLocale } from "../context/LocaleContext";

// Scripted (tutorial) waves only reference generic templates, which are
// bundled eagerly — so day-1 lookups stay synchronous.
const templateMap = new Map(
  eagerTemplates.map((template) => [template.templateId, template])
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

const waveTrackerStore = new Map<string, WaveTracker>();
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

export const templateMatchesPreference = (
  template: PullRequestTemplate,
  preference: LanguagePreference
): boolean => {
  const languages = getCodeLanguages(template.files);
  const isGeneric = languages.length === 0;
  if (preference.length === 0) {
    return true;
  }
  if (isGeneric) {
    return true;
  }
  return languages.some((language) => preference.includes(language));
};

export const tutorialBlocksLaterWave = (day: number, minute: number, queue: PullRequest[]): boolean => {
  if (day !== 1 || minute <= 0) return false;
  const tutorialTemplateIds = new Set(tutorialWaves[1]?.flatMap(wave => wave.templateIds) ?? []);
  return queue.some(pr => tutorialTemplateIds.has(pr.templateId));
};

const getWaveTracker = (key: string): WaveTracker => {
  const existing = waveTrackerStore.get(key);
  if (existing) {
    return existing;
  }
  const tracker: WaveTracker = { waves: new Set(), scripted: new Set() };
  waveTrackerStore.set(key, tracker);
  return tracker;
};

export const usePRSpawner = () => {
  const {
    state: {
      phase,
      runId,
      currentTime,
      currentDay,
      queue,
      languagePreference,
      difficulty, // SPIKE(plan 010): gates the learning-mode ordering branches below
      simulationPaused,
      deliveryMarkers,
      spawnedTemplateIds,
    },
    actions: { enqueuePRs, markDelivery, recordSpawnedTemplates },
  } = useGameState();
  const { locale } = useLocale();

  const trackerRef = useRef<WaveTracker>(getWaveTracker(`${runId}:${currentDay}`));
  const workingPoolRef = useRef<PullRequestTemplate[]>([]);
  const basePoolRef = useRef<PullRequestTemplate[]>([]);
  const spawnCountRef = useRef(0);
  const trackerResetKeyRef = useRef<string>("");
  const lastHourlyCheckRef = useRef<number>(-1);

  const drawBatch = useCallback(
    (count: number, day: number): PullRequest[] => {
      const results: PullRequest[] = [];
      for (let i = 0; i < count; i += 1) {
        if (workingPoolRef.current.length === 0 && difficulty === "learning") { // SPIKE(plan 010): learning-mode refill
          workingPoolRef.current = orderForLearning(basePoolRef.current, day); // SPIKE: refill keeps curriculum order — no reshuffle on exhaustion (known spike simplification: repeats arrive in the same order each refill)
        } // SPIKE(plan 010)
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
    [
      locale,
      difficulty, // SPIKE(plan 010): dep for the learning-mode refill branch above
    ]
  );

  const spawnSpecific = useCallback(
    (templateIds: string[], day: number): PullRequest[] => {
      const results: PullRequest[] = [];
      templateIds.forEach((templateId) => {
        const template = templateMap.get(templateId);
        if (!template) {
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
    [locale]
  );

  useEffect(() => {
    let cancelled = false;

    const applyPools = (templates: PullRequestTemplate[]) => {
      const alreadySpawned = new Set(spawnedTemplateIds);
      const eligible = templates.filter((template) => templateMatchesPreference(template, languagePreference));
      const unseen = eligible.filter(template => !alreadySpawned.has(template.templateId));
      const basePool = unseen.length > 0 ? unseen : eligible;
      basePoolRef.current = basePool;
      if (difficulty === "learning") { // SPIKE(plan 010): learning mode orders the pool by curriculum tier for the current day; normal mode falls through to the pre-spike shuffle untouched
        workingPoolRef.current = orderForLearning(basePool, currentDay); // SPIKE: deterministic curriculum order (see docs/learning-mode-curriculum.md)
        return; // SPIKE: skip the normal-mode shuffle below
      } // SPIKE(plan 010)
      workingPoolRef.current = shuffle(basePool);
    };

    // Seed synchronously from the eager (generic) pack so the day-1 scripted
    // tutorial wave and early draws never wait on a lazy-loaded chunk.
    applyPools(eagerTemplates);
    spawnCountRef.current = 0;
    lastHourlyCheckRef.current = -1;

    // Empty preference means "everything" (see templateMatchesPreference),
    // so load every pack; otherwise only the selected languages' packs.
    const selectedLoaders =
      languagePreference.length === 0
        ? Object.values(templateLoaders)
        : Object.entries(templateLoaders)
            .filter(([language]) => languagePreference.includes(language))
            .map(([, loader]) => loader);

    if (selectedLoaders.length > 0) {
      Promise.all(selectedLoaders.map((loader) => loader()))
        .then((packs) => {
          if (cancelled) {
            // A newer effect run (day/preference change) owns the pool now.
            return;
          }
          applyPools([...eagerTemplates, ...packs.flat()]);
        })
        .catch((error) => {
          if (process.env.NODE_ENV !== "production") {
            console.error(
              "[Spawner] Failed to load language template packs",
              error
            );
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [
    currentDay,
    languagePreference,
    difficulty, // SPIKE(plan 010): re-derive pools when the mode changes so learning ordering applies
    spawnedTemplateIds,
  ]);

  useEffect(() => {
    const key = `${runId}:${currentDay}`;
    if (trackerResetKeyRef.current !== key) {
      trackerResetKeyRef.current = key;
      trackerRef.current = getWaveTracker(key);
    }
    deliveryMarkers.forEach(marker => {
      if (marker.startsWith('default:')) trackerRef.current.waves.add(Number(marker.slice('default:'.length)));
      if (marker.startsWith('scripted:')) trackerRef.current.scripted.add(marker.slice('scripted:'.length));
      if (marker.startsWith('hourly:')) lastHourlyCheckRef.current = Math.max(lastHourlyCheckRef.current, Number(marker.slice('hourly:'.length)));
    });
  }, [currentDay, deliveryMarkers, runId]);

  useEffect(() => {
    if (phase !== "WORK" || simulationPaused) {
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
        if (shouldSkipDefaultWave(minute)) {
          triggeredWaves.add(minute);
          markDelivery(`default:${minute}`);
          return;
        }
        if (tutorialBlocksLaterWave(currentDay, minute, queue)) {
          return;
        }
        const count = minute === 0 ? 2 : pickWeightedWaveCount();
        const prs = drawBatch(count, currentDay);
        if (prs.length === 0 && basePoolRef.current.length === 0) {
          // Lazy language packs may still be loading; leave the wave marker
          // unset so this wave re-attempts on the next tick instead of being
          // silently lost (waves must fire — see agent.md non-negotiables).
          return;
        }
        triggeredWaves.add(minute);
        if (prs.length > 0) {
          enqueuePRs(prs);
          recordSpawnedTemplates(prs.map(pr => pr.templateId));
          markDelivery(`default:${minute}`);
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
          recordSpawnedTemplates(prs.map(pr => pr.templateId));
          markDelivery(`scripted:${key}`);
        }
      }
    });

    const currentHour = Math.floor(currentTime / 60);
    const withinHourlyWindow = currentDay > 1 && currentHour >= 1 && currentHour <= 7;
    if (withinHourlyWindow && currentHour !== lastHourlyCheckRef.current) {
      const totalQueue = queue.length;
      if (totalQueue === 0) {
        const prs = drawBatch(1, currentDay);
        if (prs.length > 0) {
          lastHourlyCheckRef.current = currentHour;
          enqueuePRs(prs);
          recordSpawnedTemplates(prs.map(pr => pr.templateId));
          markDelivery(`hourly:${currentHour}`);
        }
      } else {
        lastHourlyCheckRef.current = currentHour;
      }
    }
  }, [
    phase,
    simulationPaused,
    currentTime,
    currentDay,
    enqueuePRs,
    markDelivery,
    recordSpawnedTemplates,
    queue,
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
