import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  WORK_DAY_MINUTES,
  QUEUE_PRESSURE_CHEVRON_CAP,
  QUEUE_AGING_MIN_DRAIN,
  QUEUE_AGING_MAX_DRAIN
} from '../constants/game';
import { DayMantra, getDayMantra, getDefaultDayMantra } from '../data/dayMantras';
import { getDefaultDayQuote, getRandomDayQuote } from '../data/dayQuotes';
import {
  Counters,
  DaySummary,
  DayQuote,
  Difficulty,
  FalsePositiveRecord,
  GamePhase,
  LanguagePreference,
  LineExcerpt,
  LineReference,
  NormalizedPullRequest,
  MeterSet,
  ProdIncident,
  PullRequest
} from '../types';
import { clamp, calculateQueuePressure } from '../utils/helpers';
import { GameOverReasonKey } from '../constants/i18n';
import { useTranslations } from '../hooks/useTranslations';
import { evaluateDecision, type DecisionReceipt, type ReviewVerdict } from '../utils/decision';
import { lineReferenceKey, normalizePullRequest } from '../utils/templateNormalization';

export interface GameState {
  runId: number;
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
  lastDecision: DecisionReceipt | null;
  decisionReceipts: DecisionReceipt[];
  simulationPaused: boolean;
}

export interface DecisionResult {
  success: boolean;
  status: 'approved' | 'true-positive' | 'false-positive' | 'error';
  message: string;
  bonusApplied?: boolean;
  receipt?: DecisionReceipt;
}

export interface RequestChangesPayload {
  selectedRefs?: LineReference[];
  /** Compatibility adapter for callers not yet migrated; ambiguous numbers fail closed. */
  selectedLines?: number[];
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
    setSimulationPaused: (paused: boolean) => void;
  };
}

export type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'QUEUE_PRS'; prs: PullRequest[] }
  | { type: 'SET_CURRENT_PR'; id: string | null }
  | { type: 'REVIEW_PR'; prId: string; verdict: ReviewVerdict; selectedRefs: LineReference[] }
  | { type: 'RESET_FOR_DAY'; nextDay: number; mantra: DayMantra }
  | { type: 'PUSH_SUMMARY'; summary: DaySummary }
  | { type: 'SET_GAME_OVER'; reason?: GameOverReasonKey }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LANGUAGE_PREFERENCE'; preference: LanguagePreference }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_SIMULATION_PAUSED'; paused: boolean }
  | { type: 'LOG_PROD_INCIDENT'; incident: ProdIncident }
  | { type: 'LOG_FALSE_POSITIVE'; record: FalsePositiveRecord }
  | { type: 'RANDOMIZE_DAY_FLAVOR'; mantra: DayMantra; quote: DayQuote };

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

export const createInitialState = (): GameState => {
  return {
    runId: 1,
    currentDay: 1,
    phase: 'BRIEFING',
    languagePreference: ['generic', 'typescript'],
    difficulty: 'normal',
    currentTime: 0,
    queue: [],
    currentPR: null,
    meters: createInitialMeters(),
    counters: createInitialCounters(),
    history: [],
    currentMantra: getDefaultDayMantra(),
    gameOverReason: undefined,
    dayQuote: getDefaultDayQuote(),
    prodIncidents: [],
    falsePositiveRecords: [],
    lastDecision: null,
    decisionReceipts: [],
    simulationPaused: false
  };
};

const initialState: GameState = createInitialState();

export const computeQueueDrain = (pressure: number): number => {
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

export const getQueueAgingDelta = (queue: PullRequest[], difficulty: Difficulty): Partial<MeterSet> | null => {
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

const extractLineExcerpts = (files: NormalizedPullRequest['files'], refs: LineReference[]): LineExcerpt[] => {
  const targets = new Set(refs.map(lineReferenceKey));
  return files.flatMap(file => file.lines
    .filter(line => targets.has(lineReferenceKey({ filename: file.filename, rowId: line.rowId })))
    .map(line => ({ filename: file.filename, rowId: line.rowId, lineNumber: line.lineNumber, content: line.content.trimEnd() })));
};

/** Numeric compatibility is safe only when a displayed number identifies exactly one file row. */
export const resolveDecisionSelection = (pr: NormalizedPullRequest, payload: RequestChangesPayload): LineReference[] => {
  if (payload.selectedRefs) return payload.selectedRefs.map(ref => ({ ...ref }));
  return (payload.selectedLines ?? []).map(lineNumber => {
    const matches = pr.files.flatMap(file => file.lines
      .filter(line => line.lineNumber === lineNumber)
      .map(line => ({ filename: file.filename, rowId: line.rowId })));
    if (matches.length !== 1) throw new Error('Missing or ambiguous selected line');
    return matches[0];
  });
};

export const maybeGameOver = (state: GameState): GameState => {
  if (state.phase === 'GAME_OVER') {
    return state;
  }

  if (state.meters.stability <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'stability' };
  }

  if (state.meters.satisfaction <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'satisfaction' };
  }

  if (state.meters.velocity <= MIN_METER_VALUE) {
    return { ...state, phase: 'GAME_OVER', gameOverReason: 'velocity' };
  }

  return state;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_PHASE': {
      return { ...state, phase: action.phase, simulationPaused: action.phase === 'WORK' ? state.simulationPaused : false };
    }
    case 'ADVANCE_TIME': {
      if (state.phase !== 'WORK' || state.simulationPaused) {
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
      if (state.phase !== 'WORK' || state.simulationPaused || action.prs.length === 0) {
        return state;
      }
      const seen = new Set([...state.queue.map(pr => pr.id), ...state.decisionReceipts.map(receipt => receipt.prId)]);
      const incoming = action.prs.filter(pr => {
        if (seen.has(pr.id)) return false;
        seen.add(pr.id);
        return true;
      });
      if (!incoming.length) return state;
      const mergedQueue = [...state.queue, ...incoming];
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
    case 'REVIEW_PR': {
      // A queued action may be replayed after a render, timer tick, or another verdict.
      if (state.phase !== 'WORK' || state.simulationPaused || state.currentPR?.id !== action.prId ||
        state.decisionReceipts.some(receipt => receipt.prId === action.prId)) return state;
      const current = state.queue.find(pr => pr.id === action.prId);
      if (!current) return state;
      let pr: NormalizedPullRequest;
      let receipt: DecisionReceipt;
      try {
        pr = normalizePullRequest(current);
        receipt = evaluateDecision(pr, action.verdict, action.selectedRefs, state.meters);
      } catch {
        return state;
      }
      const remainingQueue = state.queue.filter(pr => pr.id !== action.prId);
      const incidents: ProdIncident[] = receipt.outcome === 'buggy-approval'
        ? pr.bugPatterns.map(pattern => ({
          prId: pr.id, title: pr.title, author: pr.author, bugKind: pattern.kind, severity: pattern.severity,
          lines: extractLineExcerpts(pr.files, pattern.lineRefs), description: pattern.description
        })) : [];
      const falsePositives: FalsePositiveRecord[] = receipt.outcome === 'false-positive'
        ? [{ prId: pr.id, title: pr.title, author: pr.author,
          selectedLines: extractLineExcerpts(pr.files, action.selectedRefs), actualBugKinds: [] }] : [];
      return maybeGameOver({
        ...state,
        queue: remainingQueue,
        currentPR: remainingQueue[0] ?? null,
        counters: applyCounterDelta(state.counters, receipt.counterDelta),
        meters: receipt.metersAfter,
        prodIncidents: [...state.prodIncidents, ...incidents],
        falsePositiveRecords: [...state.falsePositiveRecords, ...falsePositives],
        lastDecision: receipt,
        decisionReceipts: [...state.decisionReceipts, receipt]
      });
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
        falsePositiveRecords: [],
        lastDecision: null,
        decisionReceipts: [],
        simulationPaused: false
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
        runId: state.runId + 1,
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
    case 'SET_SIMULATION_PAUSED': {
      if (state.phase !== 'WORK' || state.simulationPaused === action.paused) return state;
      return { ...state, simulationPaused: action.paused };
    }
    case 'LOG_PROD_INCIDENT': {
      return { ...state, prodIncidents: [...state.prodIncidents, action.incident] };
    }
    case 'LOG_FALSE_POSITIVE': {
      return { ...state, falsePositiveRecords: [...state.falsePositiveRecords, action.record] };
    }
    case 'RANDOMIZE_DAY_FLAVOR': {
      // Only reshuffle the flavor on a fresh day-1 briefing; a mid-game remount
      // must not overwrite the current day's mantra/quote.
      if (state.phase !== 'BRIEFING' || state.currentDay !== 1 || state.history.length !== 0) {
        return state;
      }
      return { ...state, currentMantra: action.mantra, dayQuote: action.quote };
    }
    default:
      return state;
  }
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const translations = useTranslations();
  const decisionLocks = useRef(new Set<string>());
  const dayTransitionLock = useRef<number | null>(null);
  useEffect(() => { decisionLocks.current.clear(); }, [state.currentDay]);
  useEffect(() => { dayTransitionLock.current = null; }, [state.currentDay, state.runId]);

  // The initial state is deterministic so server HTML and client hydration
  // match; the random day flavor is applied after mount (effects never run
  // during hydration's first pass).
  useEffect(() => {
    dispatch({ type: 'RANDOMIZE_DAY_FLAVOR', mantra: getDayMantra(), quote: getRandomDayQuote() });
  }, []);

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

  const decideCurrentPR = useCallback((verdict: ReviewVerdict, payload: RequestChangesPayload = {}): DecisionResult => {
    const current = state.currentPR;
    const decisionCopy = translations.decisions;
    if (state.phase !== 'WORK' || state.simulationPaused || !current || !state.queue.some(pr => pr.id === current.id) || decisionLocks.current.has(current.id)) {
      return { success: false, status: 'error', message: decisionCopy.noPR };
    }
    try {
      const pr = normalizePullRequest(current);
      const selectedRefs = resolveDecisionSelection(pr, payload);
      const receipt = evaluateDecision(pr, verdict, selectedRefs, state.meters);
      decisionLocks.current.add(current.id);
      dispatch({ type: 'REVIEW_PR', prId: current.id, verdict, selectedRefs });
      return {
        success: true,
        status: verdict === 'approve' ? 'approved' : receipt.correct ? 'true-positive' : 'false-positive',
        message: verdict === 'approve'
          ? receipt.correct ? decisionCopy.cleanMerge : decisionCopy.bugSlip
          : receipt.bonusApplied ? decisionCopy.requestBonus : decisionCopy.requestNoBonus,
        bonusApplied: receipt.bonusApplied,
        receipt
      };
    } catch {
      return { success: false, status: 'error', message: decisionCopy.noPR };
    }
  }, [state.currentPR, state.phase, state.simulationPaused, state.queue, state.meters, translations]);

  const approveCurrentPR = useCallback(() => decideCurrentPR('approve'), [decideCurrentPR]);
  const requestChanges = useCallback((payload: RequestChangesPayload) => decideCurrentPR('request-changes', payload), [decideCurrentPR]);

  const advanceToNextDay = useCallback(() => {
    if (state.phase !== 'SUMMARY' || dayTransitionLock.current === state.currentDay) {
      return;
    }
    dayTransitionLock.current = state.currentDay;
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
    decisionLocks.current.clear();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setLanguagePreference = useCallback((preference: LanguagePreference) => {
    dispatch({ type: 'SET_LANGUAGE_PREFERENCE', preference });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const setSimulationPaused = useCallback((paused: boolean) => {
    dispatch({ type: 'SET_SIMULATION_PAUSED', paused });
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
        setDifficulty,
        setSimulationPaused
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
      setDifficulty,
      setSimulationPaused
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
