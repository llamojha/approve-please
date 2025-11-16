import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { MAX_METER_VALUE, MIN_METER_VALUE, WORK_DAY_MINUTES } from '../constants/game';
import { getDayConfig } from '../data/dayConfigs';
import { getRandomDayQuote } from '../data/dayQuotes';
import {
  BugKind,
  Counters,
  DayConfig,
  DaySummary,
  GamePhase,
  LanguagePreference,
  MeterSet,
  PullRequest,
  Rule,
  DayQuote
} from '../types';
import { clamp } from '../utils/helpers';

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
  | { type: 'SET_LANGUAGE_PREFERENCE'; preference: LanguagePreference };

const createInitialCounters = (): Counters => ({
  bugsToProd: 0,
  prsApproved: 0,
  prsRejected: 0,
  truePositives: 0,
  falsePositives: 0
});

const createInitialMeters = (): MeterSet => ({
  stability: 100,
  velocity: 55,
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
    dayQuote: getRandomDayQuote()
  };
};

const initialState: GameState = createInitialState();

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
      return { ...state, currentTime: nextTime, phase: nextPhase };
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
        dayQuote: getRandomDayQuote()
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
