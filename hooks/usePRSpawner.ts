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

export const usePRSpawner = () => {
  const {
    state: {
      phase,
      currentTime,
      currentDay,
      queue,
      currentPR,
      deliveredWaveIds,
      languagePreference,
      difficulty, // SPIKE(plan 010): gates the learning-mode ordering branches below
    },
    actions: { deliverWave },
  } = useGameState();
  const { locale } = useLocale();

  const workingPoolRef = useRef<PullRequestTemplate[]>([]);
  const basePoolRef = useRef<PullRequestTemplate[]>([]);
  const spawnCountRef = useRef(0);
  const pendingDeliveriesRef = useRef<Map<string, PullRequest[]>>(new Map());

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
    [languagePreference, locale]
  );

  useEffect(() => {
    let cancelled = false;

    const applyPools = (templates: PullRequestTemplate[]) => {
      const basePool = templates.filter((template) =>
        templateMatchesPreference(template, languagePreference)
      );
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
  ]);

  useEffect(() => {
    if (phase !== "WORK") {
      return;
    }

    const scriptedWaves = getScriptedWavesForDay(currentDay);
    const delivered = new Set(deliveredWaveIds);
    deliveredWaveIds.forEach((waveId) => {
      pendingDeliveriesRef.current.delete(waveId);
    });
    const prepareDelivery = (
      waveId: string,
      create: () => PullRequest[],
      consumesWorkingPool: boolean
    ): PullRequest[] => {
      const pending = pendingDeliveriesRef.current.get(waveId);
      if (pending) {
        if (consumesWorkingPool) {
          pending.forEach((pr) => {
            const templateIndex = workingPoolRef.current.findIndex(
              (template) => template.templateId === pr.templateId
            );
            if (templateIndex >= 0) {
              workingPoolRef.current.splice(templateIndex, 1);
            }
          });
        }
        return pending;
      }
      const prs = create();
      if (prs.length > 0) {
        pendingDeliveriesRef.current.set(waveId, prs);
      }
      return prs;
    };
    const deliver = (waveId: string, prs: PullRequest[] = []) => {
      delivered.add(waveId);
      deliverWave(waveId, prs);
    };
    const shouldSkipDefaultWave = (minute: number): boolean => {
      return scriptedWaves.some((wave) => wave.atMinute === minute);
    };

    DEFAULT_WAVE_MINUTES.forEach((minute) => {
      const waveId = `default:${minute}`;
      if (currentTime >= minute && !delivered.has(waveId)) {
        if (shouldSkipDefaultWave(minute)) {
          deliver(waveId);
          return;
        }
        const count = minute === 0 ? 2 : pickWeightedWaveCount();
        const prs = prepareDelivery(
          waveId,
          () => drawBatch(count, currentDay),
          true
        );
        if (prs.length === 0 && basePoolRef.current.length === 0) {
          // Lazy language packs may still be loading; leave the wave marker
          // unset so this wave re-attempts on the next tick instead of being
          // silently lost (waves must fire — see agent.md non-negotiables).
          return;
        }
        deliver(waveId, prs);
      }
    });

    scriptedWaves.forEach((wave, index) => {
      const waveId = `scripted:${wave.atMinute}:${index}`;
      if (currentTime >= wave.atMinute && !delivered.has(waveId)) {
        const prs = prepareDelivery(
          waveId,
          () => spawnSpecific(wave.templateIds, currentDay),
          false
        );
        deliver(waveId, prs);
      }
    });

    const currentHour = Math.floor(currentTime / 60);
    const hourlyWaveId = `hourly:${currentHour}`;
    const withinHourlyWindow = currentHour >= 1 && currentHour <= 7;
    if (withinHourlyWindow && !delivered.has(hourlyWaveId)) {
      const totalQueue = queue.length + (currentPR ? 1 : 0);
      if (totalQueue === 0) {
        const prs = prepareDelivery(
          hourlyWaveId,
          () => drawBatch(1, currentDay),
          true
        );
        if (prs.length > 0) {
          deliver(hourlyWaveId, prs);
        }
      } else {
        deliver(hourlyWaveId);
      }
    }
  }, [
    phase,
    currentTime,
    currentDay,
    deliveredWaveIds,
    deliverWave,
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
