import { describe, expect, it } from 'vitest';
import {
  computeQueueDrain,
  createInitialState,
  gameReducer,
  getQueueAgingDelta,
  maybeGameOver,
  GameState
} from '../context/GameContext';
import {
  APPROVAL_EFFECTS,
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  QUEUE_AGING_IMPORTANCE_WEIGHT,
  QUEUE_AGING_MIN_DRAIN,
  REQUEST_CHANGES_EFFECTS,
  WORK_DAY_MINUTES
} from '../constants/gameSettings';
import { getDayMantra, getDefaultDayMantra } from '../data/dayMantras';
import { getDefaultDayQuote } from '../data/dayQuotes';
import type { FalsePositiveRecord, PullRequest } from '../types';

const makePR = (id: string, importance: PullRequest['importance'] = 'normal'): PullRequest => ({
  id,
  templateId: `tpl-${id}`,
  title: `PR ${id}`,
  author: 'test-author',
  description: 'A test pull request',
  tags: [],
  files: [
    {
      filename: 'index.ts',
      language: 'typescript',
      lines: [{ lineNumber: 1, content: 'const value = 1;', isNew: true }]
    }
  ],
  bugPatterns: [],
  importance,
  estimatedReviewSeconds: 30
});

const workState = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(),
  phase: 'WORK',
  ...overrides
});

describe('gameReducer ADVANCE_TIME', () => {
  it('advances currentTime during WORK', () => {
    const state = workState();
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    expect(next.currentTime).toBe(1);
    expect(next.phase).toBe('WORK');
  });

  it('transitions to SUMMARY when reaching WORK_DAY_MINUTES', () => {
    const state = workState({ currentTime: WORK_DAY_MINUTES - 1 });
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    expect(next.currentTime).toBe(WORK_DAY_MINUTES);
    expect(next.phase).toBe('SUMMARY');
  });

  it('caps currentTime at WORK_DAY_MINUTES', () => {
    const state = workState({ currentTime: WORK_DAY_MINUTES - 1 });
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 999 });
    expect(next.currentTime).toBe(WORK_DAY_MINUTES);
  });

  it('returns the same state object in any non-WORK phase', () => {
    const phases = ['BRIEFING', 'SUMMARY', 'GAME_OVER'] as const;
    phases.forEach((phase) => {
      const state = { ...createInitialState(), phase };
      const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
      expect(next).toBe(state);
    });
  });

  it('drains velocity and satisfaction from queue aging on normal difficulty', () => {
    const state = workState({ queue: [makePR('a')], difficulty: 'normal' });
    const pressure = QUEUE_AGING_IMPORTANCE_WEIGHT.normal;
    // pressure <= 1, so drain scales linearly from the minimum drain
    const expectedDrain = pressure * QUEUE_AGING_MIN_DRAIN;
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    expect(next.meters.velocity).toBeCloseTo(MAX_METER_VALUE - expectedDrain, 10);
    expect(next.meters.satisfaction).toBeCloseTo(MAX_METER_VALUE - expectedDrain, 10);
    expect(next.meters.stability).toBe(MAX_METER_VALUE);
  });

  it('does not drain meters on learning difficulty', () => {
    const state = workState({ queue: [makePR('a')], difficulty: 'learning' });
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    expect(next.meters).toEqual(state.meters);
  });

  it('does not drain meters when the queue is empty', () => {
    const state = workState({ queue: [], difficulty: 'normal' });
    const next = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    expect(next.meters).toEqual(state.meters);
  });
});

describe('queue aging helpers', () => {
  it('getQueueAgingDelta returns null for learning difficulty or empty queue', () => {
    expect(getQueueAgingDelta([makePR('a')], 'learning')).toBeNull();
    expect(getQueueAgingDelta([], 'normal')).toBeNull();
  });

  it('computeQueueDrain returns 0 for non-positive pressure', () => {
    expect(computeQueueDrain(0)).toBe(0);
    expect(computeQueueDrain(-1)).toBe(0);
  });
});

describe('maybeGameOver', () => {
  it('ends the game with reason stability when stability hits MIN_METER_VALUE', () => {
    const state = workState();
    const next = maybeGameOver({ ...state, meters: { ...state.meters, stability: MIN_METER_VALUE } });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('stability');
  });

  it('ends the game with reason satisfaction when satisfaction hits MIN_METER_VALUE', () => {
    const state = workState();
    const next = maybeGameOver({ ...state, meters: { ...state.meters, satisfaction: MIN_METER_VALUE } });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('satisfaction');
  });

  // Regression test for the recently added velocity game-over condition
  it('ends the game with reason velocity when velocity hits MIN_METER_VALUE', () => {
    const state = workState();
    const next = maybeGameOver({ ...state, meters: { ...state.meters, velocity: MIN_METER_VALUE } });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('velocity');
  });

  it('returns the same state when all meters are above MIN_METER_VALUE', () => {
    const state = workState();
    expect(maybeGameOver(state)).toBe(state);
  });
});

describe('gameReducer QUEUE_PRS', () => {
  it('merges the queue and selects the first item when no PR is current', () => {
    const a = makePR('a');
    const b = makePR('b');
    const state = workState();
    const next = gameReducer(state, { type: 'QUEUE_PRS', prs: [a, b] });
    expect(next.queue).toEqual([a, b]);
    expect(next.currentPR).toBe(a);
  });

  it('keeps the current PR when one is already selected', () => {
    const a = makePR('a');
    const b = makePR('b');
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, { type: 'QUEUE_PRS', prs: [b] });
    expect(next.queue).toEqual([a, b]);
    expect(next.currentPR).toBe(a);
  });

  it('is a no-op (same object) for an empty prs array', () => {
    const state = workState();
    const next = gameReducer(state, { type: 'QUEUE_PRS', prs: [] });
    expect(next).toBe(state);
  });
});

describe('gameReducer APPLY_DECISION', () => {
  it('removes the processed PR, advances currentPR, and applies deltas', () => {
    const a = makePR('a');
    const b = makePR('b');
    const state = workState({ queue: [a, b], currentPR: a });
    const next = gameReducer(state, {
      type: 'APPLY_DECISION',
      processedId: a.id,
      counterDelta: { ...APPROVAL_EFFECTS.baseCounters, ...APPROVAL_EFFECTS.cleanCounters },
      meterDelta: {
        velocity: APPROVAL_EFFECTS.velocityOnClean,
        satisfaction: APPROVAL_EFFECTS.satisfactionOnClean
      }
    });
    expect(next.queue).toEqual([b]);
    expect(next.currentPR).toBe(b);
    expect(next.counters.prsApproved).toBe(state.counters.prsApproved + APPROVAL_EFFECTS.baseCounters.prsApproved);
    expect(next.counters.cleanApprovals).toBe(
      state.counters.cleanApprovals + APPROVAL_EFFECTS.cleanCounters.cleanApprovals
    );
    // meters started at MAX, so positive deltas clamp to MAX_METER_VALUE
    expect(next.meters.velocity).toBe(MAX_METER_VALUE);
    expect(next.meters.satisfaction).toBe(MAX_METER_VALUE);
  });

  it('sets currentPR to null when the queue empties', () => {
    const a = makePR('a');
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, {
      type: 'APPLY_DECISION',
      processedId: a.id,
      counterDelta: {},
      meterDelta: {}
    });
    expect(next.queue).toEqual([]);
    expect(next.currentPR).toBeNull();
  });

  it('clamps meters to MIN_METER_VALUE and triggers game over', () => {
    const a = makePR('a');
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, {
      type: 'APPLY_DECISION',
      processedId: a.id,
      counterDelta: {},
      meterDelta: { stability: -(MAX_METER_VALUE * 2) }
    });
    expect(next.meters.stability).toBe(MIN_METER_VALUE);
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('stability');
  });
});

describe('gameReducer false-positive tracking', () => {
  const makeRecord = (prId: string): FalsePositiveRecord => ({
    prId,
    title: `PR ${prId}`,
    author: 'test-author',
    selectedLines: [{ lineNumber: 1, content: 'const value = 1;' }],
    actualBugKinds: []
  });

  it('LOG_FALSE_POSITIVE appends a record', () => {
    const state = workState();
    const record = makeRecord('a');
    const next = gameReducer(state, { type: 'LOG_FALSE_POSITIVE', record });
    expect(next.falsePositiveRecords).toEqual([record]);

    const second = makeRecord('b');
    const after = gameReducer(next, { type: 'LOG_FALSE_POSITIVE', record: second });
    expect(after.falsePositiveRecords).toEqual([record, second]);
  });

  it('RESET_FOR_DAY clears falsePositiveRecords', () => {
    const state = workState({ falsePositiveRecords: [makeRecord('a')] });
    const next = gameReducer(state, { type: 'RESET_FOR_DAY', nextDay: 2, mantra: getDayMantra() });
    expect(next.falsePositiveRecords).toEqual([]);
  });

  it('APPLY_DECISION carrying missCounters increments counters.falsePositives by 1', () => {
    const a = makePR('a');
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, {
      type: 'APPLY_DECISION',
      processedId: a.id,
      counterDelta: { ...REQUEST_CHANGES_EFFECTS.baseCounters, ...REQUEST_CHANGES_EFFECTS.missCounters },
      meterDelta: { ...REQUEST_CHANGES_EFFECTS.baseMeters, ...REQUEST_CHANGES_EFFECTS.missMeters }
    });
    expect(REQUEST_CHANGES_EFFECTS.missCounters).toEqual({ falsePositives: 1 });
    expect(next.counters.falsePositives).toBe(state.counters.falsePositives + 1);
    expect(next.counters.prsRejected).toBe(state.counters.prsRejected + 1);
    // miss path must not grant the true-positive credit
    expect(next.counters.truePositives).toBe(state.counters.truePositives);
  });
});

describe('gameReducer RESET_FOR_DAY', () => {
  it('resets time/queue/counters/incidents but preserves meters', () => {
    const a = makePR('a');
    const dirtyMeters = { stability: 42, velocity: 55, satisfaction: 61 };
    const state = workState({
      currentTime: 120,
      queue: [a],
      currentPR: a,
      meters: dirtyMeters,
      counters: {
        bugsToProd: 2,
        prsApproved: 5,
        prsRejected: 1,
        truePositives: 1,
        falsePositives: 1,
        cleanApprovals: 3
      },
      prodIncidents: [
        {
          prId: a.id,
          title: a.title,
          author: a.author,
          bugKind: 'logic',
          severity: 'minor',
          lines: []
        }
      ],
      gameOverReason: 'generic'
    });
    const next = gameReducer(state, { type: 'RESET_FOR_DAY', nextDay: 2, mantra: getDayMantra() });
    expect(next.currentDay).toBe(2);
    expect(next.phase).toBe('BRIEFING');
    expect(next.currentTime).toBe(0);
    expect(next.queue).toEqual([]);
    expect(next.currentPR).toBeNull();
    expect(next.counters).toEqual({
      bugsToProd: 0,
      prsApproved: 0,
      prsRejected: 0,
      truePositives: 0,
      falsePositives: 0,
      cleanApprovals: 0
    });
    expect(next.prodIncidents).toEqual([]);
    expect(next.falsePositiveRecords).toEqual([]);
    expect(next.gameOverReason).toBeUndefined();
    // Current behavior: meters persist across days
    expect(next.meters).toEqual(dirtyMeters);
  });
});

describe('gameReducer RESET_GAME', () => {
  it('preserves languagePreference and difficulty while resetting everything else', () => {
    const state = workState({
      currentDay: 4,
      languagePreference: ['generic', 'python'],
      difficulty: 'learning',
      meters: { stability: 10, velocity: 20, satisfaction: 30 },
      counters: {
        bugsToProd: 3,
        prsApproved: 9,
        prsRejected: 2,
        truePositives: 2,
        falsePositives: 1,
        cleanApprovals: 4
      }
    });
    const next = gameReducer(state, { type: 'RESET_GAME' });
    expect(next.languagePreference).toEqual(['generic', 'python']);
    expect(next.difficulty).toBe('learning');
    expect(next.currentDay).toBe(1);
    expect(next.phase).toBe('BRIEFING');
    expect(next.meters).toEqual({
      stability: MAX_METER_VALUE,
      velocity: MAX_METER_VALUE,
      satisfaction: MAX_METER_VALUE
    });
    expect(next.counters).toEqual({
      bugsToProd: 0,
      prsApproved: 0,
      prsRejected: 0,
      truePositives: 0,
      falsePositives: 0,
      cleanApprovals: 0
    });
  });
});

describe('gameReducer RANDOMIZE_DAY_FLAVOR', () => {
  const flavor = {
    mantra: { en: 'Randomized mantra', es: 'Mantra aleatorio' },
    quote: {
      speaker: 'Test Speaker',
      role: { en: 'Tester', es: 'Probadora' },
      text: { en: 'Randomized quote', es: 'Cita aleatoria' }
    }
  };

  it('starts from deterministic defaults in the initial state', () => {
    const state = createInitialState();
    expect(state.currentMantra).toEqual(getDefaultDayMantra());
    expect(state.dayQuote).toEqual(getDefaultDayQuote());
  });

  it('replaces mantra and quote on a fresh day-1 BRIEFING state', () => {
    const state = createInitialState();
    const next = gameReducer(state, { type: 'RANDOMIZE_DAY_FLAVOR', ...flavor });
    expect(next.currentMantra).toEqual(flavor.mantra);
    expect(next.dayQuote).toEqual(flavor.quote);
  });

  it('is a no-op (same state object) when phase is not BRIEFING', () => {
    const phases = ['WORK', 'SUMMARY', 'GAME_OVER'] as const;
    phases.forEach((phase) => {
      const state = { ...createInitialState(), phase };
      const next = gameReducer(state, { type: 'RANDOMIZE_DAY_FLAVOR', ...flavor });
      expect(next).toBe(state);
    });
  });

  it('is a no-op (same state object) when currentDay is not 1', () => {
    const state = { ...createInitialState(), currentDay: 2 };
    const next = gameReducer(state, { type: 'RANDOMIZE_DAY_FLAVOR', ...flavor });
    expect(next).toBe(state);
  });

  it('is a no-op (same state object) when history is not empty', () => {
    const base = createInitialState();
    const state = {
      ...base,
      history: [{ day: 1, counters: { ...base.counters }, meters: { ...base.meters } }]
    };
    const next = gameReducer(state, { type: 'RANDOMIZE_DAY_FLAVOR', ...flavor });
    expect(next).toBe(state);
  });
});

describe('advanceToNextDay end-of-day check (characterization)', () => {
  // GameContext.advanceToNextDay re-checks only stability/satisfaction (not velocity)
  // before starting a new day. Because meters only change during WORK and every
  // change passes through maybeGameOver, a velocity of MIN_METER_VALUE has already
  // put the game in GAME_OVER before SUMMARY is reachable. This test documents that
  // the reducer path (maybeGameOver) is the mechanism covering velocity.
  it('velocity reaching MIN during WORK ends the game before SUMMARY', () => {
    const a = makePR('a');
    const state = workState({
      queue: [a],
      currentPR: a,
      meters: { stability: 50, velocity: 1, satisfaction: 50 }
    });
    const next = gameReducer(state, {
      type: 'APPLY_DECISION',
      processedId: a.id,
      counterDelta: {},
      meterDelta: { velocity: -1 }
    });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('velocity');
  });
});
