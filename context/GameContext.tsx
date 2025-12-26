import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  WORK_DAY_MINUTES,
  QUEUE_PRESSURE_CHEVRON_CAP,
  QUEUE_AGING_MIN_DRAIN,
  QUEUE_AGING_MAX_DRAIN,
  SEVERITY_WEIGHTS,
  REQUEST_CHANGES_EFFECTS,
  APPROVAL_EFFECTS
} from '../constants/game';
import { DayMantra, getDayMantra } from '../data/dayMantras';
import { getRandomDayQuote } from '../data/dayQuotes';
import {
  BugKind,
  Counters,
  DaySummary,
  DayQuote,
  Difficulty,
  FalsePositiveRecord,
  GamePhase,
  LanguagePreference,
  LineExcerpt,
  MeterSet,
  ProdIncident,
  PullRequest
} from '../types';
import { clamp, calculateQueuePressure } from '../utils/helpers';
import { GameOverReasonKey } from '../constants/i18n';
import { useTranslations } from '../hooks/useTranslations';

interface GameState {
  currentDay: number;
  phase: GamePhase;
  languagePreference: LanguagePreference;
  difficulty: Difficulty;
  currentTime: number;
  queue: PullRequest[];
  currentPR: PullRequest | null;
  meters: MeterSet;
  counters: Counters;
  history: DaySummary[];
  currentMantra: DayMantra;
  gameOverReason?: GameOverReasonKey;
  dayQuote: DayQuote;
  prodIncidents: ProdIncident[];
  falsePositiveRecords: FalsePositiveRecord[];
}

export interface DecisionResult {
  success: boolean;
  status: 'approved' | 'true-positive' | 'false-positive' | 'error';
  message: string;
  bonusApplied?: boolean;
}

interface RequestChangesPayload {
  selectedLines: number[];
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
    setDifficulty: (difficulty: Difficulty) => void;
  };
}

type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'QUEUE_PRS'; prs: PullRequest[] }
  | { type: 'SET_CURRENT_PR'; id: string | null }
  | { type: 'APPLY_DECISION'; processedId: string; counterDelta: Partial<Counters>; meterDelta: Partial<MeterSet> }
  | { type: 'RESET_FOR_DAY'; nextDay: number; mantra: DayMantra }
  | { type: 'PUSH_SUMMARY'; summary: DaySummary }
  | { type: 'SET_GAME_OVER'; reason?: GameOverReasonKey }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LANGUAGE_PREFERENCE'; preference: LanguagePreference }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'LOG_PROD_INCIDENT'; incident: ProdIncident }
  | { type: 'LOG_FALSE_POSITIVE'; record: FalsePositiveRecord };

const createInitialCounters = (): Counters => ({
  bugsToProd: 0,
  prsApproved: 0,
  prsRejected: 0,
  truePositives: 0,
  falsePositives: 0,
  cleanApprovals: 0
});

const createInitialMeters = (): MeterSet => ({
  stability: 100,
  velocity: 100,
  satisfaction: 100
});

const createInitialState = (): GameState => {
  return {
    currentDay: 1,
    phase: 'BRIEFING',
    languagePreference: ['generic', 'typescript', 'python', 'java', 'rust', 'css'],
    difficulty: 'normal',
    currentTime: 0,
    queue: [],
    currentPR: null,
    meters: createInitialMeters(),
    counters: createInitialCounters(),
    history: [],
    currentMantra: getDayMantra(),
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

const getQueueAgingDelta = (queue: PullRequest[], difficulty: Difficulty): Partial<MeterSet> | null => {
  if (difficulty === 'learning') {
    return null;
  }
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
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'stability' };
  }

  if (state.meters.satisfaction <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'satisfaction' };
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
      const queueAgingDelta = getQueueAgingDelta(state.queue, state.difficulty);
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
        counters: createInitialCounters(),
        currentMantra: action.mantra,
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
      return { ...state, phase: 'GAME_OVER', gameOverReason: action.reason ?? 'generic' };
    }
    case 'RESET_GAME': {
      const resetState = createInitialState();
      return {
        ...resetState,
        languagePreference: state.languagePreference,
        difficulty: state.difficulty,
        meters: createInitialMeters(),
        counters: createInitialCounters()
      };
    }
    case 'SET_LANGUAGE_PREFERENCE': {
      return { ...state, languagePreference: action.preference };
    }
    case 'SET_DIFFICULTY': {
      return { ...state, difficulty: action.difficulty };
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
  const translations = useTranslations();

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
    return bugs.reduce((total, bug) => total + SEVERITY_WEIGHTS[bug.severity], 0);
  };

  const approveCurrentPR = useCallback((): DecisionResult => {
    const decisionCopy = translations.decisions;
    const current = state.currentPR;
    if (!current) {
      return { success: false, status: 'error', message: decisionCopy.noPR };
    }

    const hasBugs = current.bugPatterns.length > 0;
    const counterDelta: Partial<Counters> = { ...APPROVAL_EFFECTS.baseCounters };
    const meterDelta: Partial<MeterSet> = {
      velocity: hasBugs ? APPROVAL_EFFECTS.velocityOnBug : APPROVAL_EFFECTS.velocityOnClean
    };

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
      meterDelta.stability = -score * APPROVAL_EFFECTS.stabilityPenaltyMultiplier;
      meterDelta.satisfaction = -Math.ceil(score / APPROVAL_EFFECTS.satisfactionPenaltyDivisor);
    } else {
      meterDelta.satisfaction = APPROVAL_EFFECTS.satisfactionOnClean;
      counterDelta.cleanApprovals = APPROVAL_EFFECTS.cleanCounters.cleanApprovals;
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
      message: hasBugs ? decisionCopy.bugSlip : decisionCopy.cleanMerge
    };
  }, [state.currentPR, translations]);

  const requestChanges = useCallback(
    ({ selectedLines }: RequestChangesPayload): DecisionResult => {
      const decisionCopy = translations.decisions;
      const current = state.currentPR;
      if (!current) {
        return { success: false, status: 'error', message: decisionCopy.noPR };
      }

      const hasMatchingLine =
        selectedLines.length > 0 &&
        current.bugPatterns.some((pattern) => pattern.lineNumbers.some((line) => selectedLines.includes(line)));

      const counterDelta: Partial<Counters> = { ...REQUEST_CHANGES_EFFECTS.baseCounters };
      const meterDelta: Partial<MeterSet> = { ...REQUEST_CHANGES_EFFECTS.baseMeters };

      if (hasMatchingLine) {
        Object.assign(counterDelta, REQUEST_CHANGES_EFFECTS.hitCounters);
        Object.assign(meterDelta, REQUEST_CHANGES_EFFECTS.hitMeters);
        dispatch({
          type: 'APPLY_DECISION',
          processedId: current.id,
          counterDelta,
          meterDelta
        });
        return { success: true, status: 'true-positive', message: decisionCopy.requestBonus, bonusApplied: true };
      }

      Object.assign(counterDelta, REQUEST_CHANGES_EFFECTS.missCounters);
      Object.assign(meterDelta, REQUEST_CHANGES_EFFECTS.missMeters);
      dispatch({
        type: 'APPLY_DECISION',
        processedId: current.id,
        counterDelta,
        meterDelta
      });
      return { success: true, status: 'approved', message: decisionCopy.requestNoBonus, bonusApplied: false };
    },
    [state.currentPR, translations]
  );

  const advanceToNextDay = useCallback(() => {
    if (state.phase !== 'SUMMARY') {
      return;
    }
    const summary: DaySummary = {
      day: state.currentDay,
      counters: { ...state.counters },
      meters: { ...state.meters }
    };
    dispatch({ type: 'PUSH_SUMMARY', summary });

    const nextDay = state.currentDay + 1;
    if (state.meters.stability <= 0 || state.meters.satisfaction <= 0) {
      dispatch({ type: 'SET_GAME_OVER', reason: state.gameOverReason ?? 'generic' });
      return;
    }
    const nextMantra = getDayMantra();
    dispatch({ type: 'RESET_FOR_DAY', nextDay, mantra: nextMantra });
  }, [state]);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setLanguagePreference = useCallback((preference: LanguagePreference) => {
    dispatch({ type: 'SET_LANGUAGE_PREFERENCE', preference });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
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
        setLanguagePreference,
        setDifficulty
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
      setLanguagePreference,
      setDifficulty
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
