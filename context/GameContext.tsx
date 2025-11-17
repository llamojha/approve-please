import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  WORK_DAY_MINUTES,
  QUEUE_PRESSURE_CHEVRON_CAP,
  QUEUE_AGING_MIN_DRAIN,
  QUEUE_AGING_MAX_DRAIN
} from '../constants/game';
import { getDayConfig } from '../data/dayConfigs';
import { getRandomDayQuote } from '../data/dayQuotes';
import {
  BugKind,
  Counters,
  DayConfig,
  DaySummary,
  DayQuote,
  FalsePositiveRecord,
  GamePhase,
  LanguagePreference,
  LineExcerpt,
  MeterSet,
  ProdIncident,
  PullRequest,
  Rule
} from '../types';
import { clamp, calculateQueuePressure } from '../utils/helpers';

interface GameState {
  currentDay: number;
  phase: GamePhase;
  languagePreference: LanguagePreference;
  currentTime: number;
  queue: PullRequest[];
  currentPR: PullRequest | null;
  rules: Rule[];
  meters: MeterSet;
  counters: Counters;
  history: DaySummary[];
  activeConfig: DayConfig;
  gameOverReason?: string;
  dayQuote: DayQuote;
  prodIncidents: ProdIncident[];
  falsePositiveRecords: FalsePositiveRecord[];
}

export interface DecisionResult {
  success: boolean;
  status: 'approved' | 'true-positive' | 'false-positive' | 'error';
  message: string;
}

interface RequestChangesPayload {
  selectedLines: number[];
  bugKind: BugKind;
}

interface GameContextValue {
  state: GameState;
  actions: {
    startWork: () => void;
    enqueuePRs: (prs: PullRequest[]) => void;
    selectPR: (id: string) => void;
    tickWorkMinute: () => void;
    approveCurrentPR: () => DecisionResult;
    requestChanges: (payload: RequestChangesPayload) => DecisionResult;
    advanceToNextDay: () => void;
    restartGame: () => void;
    setLanguagePreference: (preference: LanguagePreference) => void;
  };
}

type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'QUEUE_PRS'; prs: PullRequest[] }
  | { type: 'SET_CURRENT_PR'; id: string | null }
  | { type: 'APPLY_DECISION'; processedId: string; counterDelta: Partial<Counters>; meterDelta: Partial<MeterSet> }
  | { type: 'RESET_FOR_DAY'; nextDay: number; config: ReturnType<typeof getDayConfig> }
  | { type: 'PUSH_SUMMARY'; summary: DaySummary }
  | { type: 'SET_GAME_OVER'; reason: string }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LANGUAGE_PREFERENCE'; preference: LanguagePreference }
  | { type: 'LOG_PROD_INCIDENT'; incident: ProdIncident }
  | { type: 'LOG_FALSE_POSITIVE'; record: FalsePositiveRecord };

const createInitialCounters = (): Counters => ({
  bugsToProd: 0,
  prsApproved: 0,
  prsRejected: 0,
  truePositives: 0,
  falsePositives: 0
});

const createInitialMeters = (): MeterSet => ({
  stability: 100,
  velocity: 100,
  satisfaction: 100
});

const createInitialState = (): GameState => {
  const config = getDayConfig(1);
  return {
    currentDay: 1,
    phase: 'BRIEFING',
    languagePreference: 'any',
    currentTime: 0,
    queue: [],
    currentPR: null,
    rules: config.rules,
    meters: createInitialMeters(),
    counters: createInitialCounters(),
    history: [],
    activeConfig: config,
    gameOverReason: undefined,
    dayQuote: getRandomDayQuote(),
    prodIncidents: [],
    falsePositiveRecords: []
  };
};

const initialState: GameState = createInitialState();

const computeQueueDrain = (pressure: number): number => {
  if (pressure <= 0) {
    return 0;
  }
  const clamped = Math.min(pressure, QUEUE_PRESSURE_CHEVRON_CAP);
  if (clamped <= 1) {
    return clamped * QUEUE_AGING_MIN_DRAIN;
  }
  const progress = (clamped - 1) / (QUEUE_PRESSURE_CHEVRON_CAP - 1);
  return QUEUE_AGING_MIN_DRAIN + progress * (QUEUE_AGING_MAX_DRAIN - QUEUE_AGING_MIN_DRAIN);
};

const getQueueAgingDelta = (queue: PullRequest[]): Partial<MeterSet> | null => {
  if (queue.length === 0) {
    return null;
  }
  const pressure = calculateQueuePressure(queue);
  if (pressure <= 0) {
    return null;
  }

  const drain = computeQueueDrain(pressure);
  if (drain <= 0) {
    return null;
  }

  return {
    velocity: -drain,
    satisfaction: -drain
  };
};

const applyCounterDelta = (base: Counters, delta: Partial<Counters>): Counters => {
  const result: Counters = { ...base };
  (Object.keys(delta) as (keyof Counters)[]).forEach((key) => {
    result[key] = base[key] + (delta[key] ?? 0);
  });
  return result;
};

const applyMeterDelta = (base: MeterSet, delta: Partial<MeterSet>): MeterSet => {
  const result: MeterSet = { ...base };
  (Object.keys(delta) as (keyof MeterSet)[]).forEach((key) => {
    result[key] = clamp(base[key] + (delta[key] ?? 0), MIN_METER_VALUE, MAX_METER_VALUE);
  });
  return result;
};

const extractLineExcerpts = (files: PullRequest['files'], lineNumbers: number[]): LineExcerpt[] => {
  if (!lineNumbers.length) {
    return [];
  }
  const targets = new Set(lineNumbers);
  const excerpts: LineExcerpt[] = [];
  files.forEach((file) => {
    file.lines.forEach((line) => {
      if (targets.has(line.lineNumber)) {
        excerpts.push({ lineNumber: line.lineNumber, content: line.content.trimEnd() });
      }
    });
  });
  return excerpts;
};

const maybeGameOver = (state: GameState): GameState => {
  if (state.phase === 'GAME_OVER') {
    return state;
  }

  if (state.meters.stability <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'Production melted down. The board needed a scapegoat.' };
  }

  if (state.meters.satisfaction <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'Management lost confidence in your judgment.' };
  }

  return state;
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_PHASE': {
      return { ...state, phase: action.phase };
    }
    case 'ADVANCE_TIME': {
      if (state.phase !== 'WORK') {
        return state;
      }
      const nextTime = Math.min(state.currentTime + action.minutes, WORK_DAY_MINUTES);
      const reachedEnd = nextTime >= WORK_DAY_MINUTES;
      const nextPhase: GamePhase = reachedEnd ? 'SUMMARY' : state.phase;
      const queueAgingDelta = getQueueAgingDelta(state.queue);
      const meters = queueAgingDelta ? applyMeterDelta(state.meters, queueAgingDelta) : state.meters;
      const nextState = { ...state, currentTime: nextTime, phase: nextPhase, meters };
      return maybeGameOver(nextState);
    }
    case 'QUEUE_PRS': {
      if (action.prs.length === 0) {
        return state;
      }
      const mergedQueue = [...state.queue, ...action.prs];
      const nextCurrent = state.currentPR ?? mergedQueue[0] ?? null;
      return { ...state, queue: mergedQueue, currentPR: nextCurrent };
    }
    case 'SET_CURRENT_PR': {
      if (!action.id) {
        return { ...state, currentPR: null };
      }
      const nextCurrent = state.queue.find((pr) => pr.id === action.id) ?? null;
      return { ...state, currentPR: nextCurrent };
    }
    case 'APPLY_DECISION': {
      const remainingQueue = state.queue.filter((pr) => pr.id !== action.processedId);
      const nextCurrent = remainingQueue[0] ?? null;
      const counters = applyCounterDelta(state.counters, action.counterDelta);
      const meters = applyMeterDelta(state.meters, action.meterDelta);
      const nextState = { ...state, queue: remainingQueue, currentPR: nextCurrent, counters, meters };
      return maybeGameOver(nextState);
    }
    case 'RESET_FOR_DAY': {
      return {
        ...state,
        currentDay: action.nextDay,
        phase: 'BRIEFING',
        currentTime: 0,
        queue: [],
        currentPR: null,
        rules: action.config.rules,
        counters: createInitialCounters(),
        activeConfig: action.config,
        gameOverReason: undefined,
        dayQuote: getRandomDayQuote(),
        prodIncidents: [],
        falsePositiveRecords: []
      };
    }
    case 'PUSH_SUMMARY': {
      return { ...state, history: [...state.history, action.summary] };
    }
    case 'SET_GAME_OVER': {
      return { ...state, phase: 'GAME_OVER', gameOverReason: action.reason };
    }
    case 'RESET_GAME': {
      const resetState = createInitialState();
      return {
        ...resetState,
        languagePreference: state.languagePreference,
        meters: createInitialMeters(),
        counters: createInitialCounters()
      };
    }
    case 'SET_LANGUAGE_PREFERENCE': {
      return { ...state, languagePreference: action.preference };
    }
    case 'LOG_PROD_INCIDENT': {
      return { ...state, prodIncidents: [...state.prodIncidents, action.incident] };
    }
    case 'LOG_FALSE_POSITIVE': {
      return { ...state, falsePositiveRecords: [...state.falsePositiveRecords, action.record] };
    }
    default:
      return state;
  }
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startWork = useCallback(() => {
    dispatch({ type: 'SET_PHASE', phase: 'WORK' });
    dispatch({ type: 'SET_CURRENT_PR', id: state.queue[0]?.id ?? null });
  }, [state.queue]);

  const tickWorkMinute = useCallback(() => {
    dispatch({ type: 'ADVANCE_TIME', minutes: 1 });
  }, []);

  const enqueuePRs = useCallback((prs: PullRequest[]) => {
    dispatch({ type: 'QUEUE_PRS', prs });
  }, []);

  const selectPR = useCallback((id: string) => {
    dispatch({ type: 'SET_CURRENT_PR', id });
  }, []);

  const severityScore = (bugs: PullRequest['bugPatterns']) => {
    const weight = { minor: 5, major: 12, critical: 20 } as const;
    return bugs.reduce((total, bug) => total + weight[bug.severity], 0);
  };

  const approveCurrentPR = useCallback((): DecisionResult => {
    const current = state.currentPR;
    if (!current) {
      return { success: false, status: 'error', message: 'No PR loaded.' };
    }

    const hasBugs = current.bugPatterns.length > 0;
    const counterDelta: Partial<Counters> = { prsApproved: 1 };
    const meterDelta: Partial<MeterSet> = { velocity: hasBugs ? 2 : 4 };

    if (hasBugs) {
      current.bugPatterns.forEach((pattern) => {
        dispatch({
          type: 'LOG_PROD_INCIDENT',
          incident: {
            prId: current.id,
            title: current.title,
            author: current.author,
            bugKind: pattern.kind,
            severity: pattern.severity,
            lines: extractLineExcerpts(current.files, pattern.lineNumbers),
            description: pattern.description
          }
        });
      });
      const score = severityScore(current.bugPatterns);
      counterDelta.bugsToProd = current.bugPatterns.length;
      meterDelta.stability = -score;
      meterDelta.satisfaction = -Math.ceil(score / 4);
    } else {
      meterDelta.satisfaction = 2;
    }

    dispatch({
      type: 'APPLY_DECISION',
      processedId: current.id,
      counterDelta,
      meterDelta
    });

    return {
      success: true,
      status: 'approved',
      message: hasBugs ? 'Bug slipped to prod! Stability took a hit.' : 'PR merged cleanly. Velocity is happy.'
    };
  }, [state.currentPR]);

  const requestChanges = useCallback(
    ({ selectedLines, bugKind }: RequestChangesPayload): DecisionResult => {
      const current = state.currentPR;
      if (!current) {
        return { success: false, status: 'error', message: 'No PR loaded.' };
      }

      if (selectedLines.length === 0) {
        return { success: false, status: 'error', message: 'Highlight at least one suspicious line.' };
      }

      const matchingPattern = current.bugPatterns.find(
        (pattern) =>
          pattern.kind === bugKind && pattern.lineNumbers.some((line) => selectedLines.includes(line))
      );

      const counterDelta: Partial<Counters> = { prsRejected: 1 };
      const meterDelta: Partial<MeterSet> = { velocity: -3 };

      if (matchingPattern) {
        counterDelta.truePositives = 1;
        meterDelta.stability = 10;
        meterDelta.satisfaction = 3;
        dispatch({
          type: 'APPLY_DECISION',
          processedId: current.id,
          counterDelta,
          meterDelta
        });
        return { success: true, status: 'true-positive', message: 'Nice catch. You kept prod safe.' };
      }

      counterDelta.falsePositives = 1;
      meterDelta.satisfaction = -4;
      dispatch({
        type: 'LOG_FALSE_POSITIVE',
        record: {
          prId: current.id,
          title: current.title,
          author: current.author,
          claimedKind: bugKind,
          selectedLines: extractLineExcerpts(current.files, selectedLines),
          actualBugKinds: current.bugPatterns.map((pattern) => pattern.kind)
        }
      });
      dispatch({
        type: 'APPLY_DECISION',
        processedId: current.id,
        counterDelta,
        meterDelta
      });
      return { success: true, status: 'false-positive', message: 'No matching bug found. Velocity groans.' };
    },
    [state.currentPR]
  );

  const advanceToNextDay = useCallback(() => {
    if (state.phase !== 'SUMMARY') {
      return;
    }
    const summary: DaySummary = {
      day: state.currentDay,
      counters: { ...state.counters },
      meters: { ...state.meters },
      briefing: state.activeConfig.briefing
    };
    dispatch({ type: 'PUSH_SUMMARY', summary });

    const nextDay = state.currentDay + 1;
    if (state.meters.stability <= 0 || state.meters.satisfaction <= 0) {
      dispatch({ type: 'SET_GAME_OVER', reason: state.gameOverReason ?? 'Leadership pulled you aside.' });
      return;
    }
    const nextConfig = getDayConfig(nextDay);
    dispatch({ type: 'RESET_FOR_DAY', nextDay, config: nextConfig });
  }, [state]);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setLanguagePreference = useCallback((preference: LanguagePreference) => {
    dispatch({ type: 'SET_LANGUAGE_PREFERENCE', preference });
  }, []);

  const value = useMemo(
    () => ({
      state,
      actions: {
        startWork,
        enqueuePRs,
        selectPR,
        tickWorkMinute,
        approveCurrentPR,
        requestChanges,
        advanceToNextDay,
        restartGame,
        setLanguagePreference
      }
    }),
    [
      state,
      startWork,
      enqueuePRs,
      selectPR,
      tickWorkMinute,
      approveCurrentPR,
      requestChanges,
      advanceToNextDay,
      restartGame,
      setLanguagePreference
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used inside GameProvider');
  }
  return context;
};
