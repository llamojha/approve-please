import { describe, expect, it } from 'vitest';
import {
  computeQueueDrain,
  createInitialState,
  gameReducer,
  getQueueAgingDelta,
  maybeGameOver,
  resolveDecisionSelection,
  GameState
} from '../context/GameContext';
import {
  APPROVAL_EFFECTS,
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  QUEUE_AGING_IMPORTANCE_WEIGHT,
  QUEUE_AGING_MIN_DRAIN,
  WORK_DAY_MINUTES
} from '../constants/gameSettings';
import { getDayMantra, getDefaultDayMantra } from '../data/dayMantras';
import { getDefaultDayQuote } from '../data/dayQuotes';
import { normalizePullRequest } from '../utils/templateNormalization';
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

describe('gameReducer atomic review decisions', () => {
  it('removes the PR, advances the queue and applies evaluated clean-approval effects', () => {
    const a = makePR('a');
    const b = makePR('b');
    const state = workState({ queue: [a, b], currentPR: a });
    const next = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'approve', selectedRefs: [] });
    expect(next.queue).toEqual([b]);
    expect(next.currentPR).toBe(b);
    expect(next.counters.prsApproved).toBe(APPROVAL_EFFECTS.baseCounters.prsApproved);
    expect(next.counters.cleanApprovals).toBe(APPROVAL_EFFECTS.cleanCounters.cleanApprovals);
    expect(next.meters).toEqual(state.meters);
    expect(next.lastDecision).toMatchObject({ outcome: 'clean-approval', appliedMeterDelta: { stability: 0, velocity: 0, satisfaction: 0 } });
    expect(next.decisionReceipts).toEqual([next.lastDecision]);
  });

  it('records actual capped meter deltas from the reducer state after a preceding timer tick', () => {
    const a = makePR('a');
    const state = workState({ queue: [a], currentPR: a, meters: { stability: 100, velocity: 99, satisfaction: 99 } });
    const afterTick = gameReducer(state, { type: 'ADVANCE_TIME', minutes: 1 });
    const next = gameReducer(afterTick, { type: 'REVIEW_PR', prId: a.id, verdict: 'approve', selectedRefs: [] });
    expect(next.lastDecision?.appliedMeterDelta.velocity).toBeCloseTo(100 - afterTick.meters.velocity);
    expect(next.lastDecision?.appliedMeterDelta.satisfaction).toBeCloseTo(100 - afterTick.meters.satisfaction);
    expect(next.queue).toEqual([]);
    expect(next.currentPR).toBeNull();
  });

  it('logs all buggy-approval incidents in the same transition and ignores duplicate verdicts', () => {
    const a = makePR('a');
    a.bugPatterns = [
      { kind: 'logic', severity: 'major', lineNumbers: [1] },
      { kind: 'security', severity: 'critical', lineNumbers: [1] }
    ];
    const state = workState({ queue: [a], currentPR: a, meters: { stability: 50, velocity: 50, satisfaction: 50 } });
    const action = { type: 'REVIEW_PR', prId: a.id, verdict: 'approve', selectedRefs: [] } as const;
    const next = gameReducer(state, { ...action, selectedRefs: [] });
    expect(next.counters).toMatchObject({ bugsToProd: 2, prsApproved: 1, cleanApprovals: 0 });
    expect(next.prodIncidents).toHaveLength(2);
    expect(next.prodIncidents[0].lines).toEqual([{ filename: 'index.ts', rowId: 'line-1', lineNumber: 1, content: 'const value = 1;' }]);
    expect(next.meters).toEqual({ stability: 18, velocity: 52, satisfaction: 42 });
    expect(next.lastDecision?.outcome).toBe('buggy-approval');
    expect(gameReducer(next, { ...action, selectedRefs: [] })).toBe(next);
  });

  it('clamps a fatal decision, records its incident and receipt, then ends the game', () => {
    const a = makePR('a');
    a.bugPatterns = [{ kind: 'security', severity: 'critical', lineNumbers: [1] }];
    const state = workState({ queue: [a], currentPR: a, meters: { stability: 2, velocity: 50, satisfaction: 50 } });
    const next = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'approve', selectedRefs: [] });
    expect(next.meters.stability).toBe(MIN_METER_VALUE);
    expect(next.lastDecision?.appliedMeterDelta.stability).toBe(-2);
    expect(next.prodIncidents).toHaveLength(1);
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('stability');
  });

  it('uses file-scoped rows and awards no precision bonus for the same number in the wrong file', () => {
    const a = makePR('a');
    a.files.push({ ...a.files[0], filename: 'second.ts' });
    a.bugPatterns = [{ kind: 'logic', severity: 'major', lineNumbers: [1], lineRefs: [{ filename: 'second.ts', rowId: 'line-1' }] }];
    const state = workState({ queue: [a], currentPR: a, meters: { stability: 50, velocity: 50, satisfaction: 50 } });
    const wrong = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'request-changes', selectedRefs: [{ filename: 'index.ts', rowId: 'line-1' }] });
    expect(wrong.lastDecision).toMatchObject({ outcome: 'correct-rejection', precision: 'inaccurate', bonusApplied: false });
    expect(wrong.counters).toMatchObject({ prsRejected: 1, falsePositives: 0, truePositives: 0 });
    expect(wrong.falsePositiveRecords).toEqual([]);
    expect(wrong.meters).toEqual({ stability: 50, velocity: 47, satisfaction: 50 });
    const right = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'request-changes', selectedRefs: [{ filename: 'second.ts', rowId: 'line-1' }] });
    expect(right.lastDecision).toMatchObject({ precision: 'precise', bonusApplied: true });
    expect(right.counters.truePositives).toBe(1);
    expect(right.meters.satisfaction).toBe(55);
    const mixed = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'request-changes', selectedRefs: [{ filename: 'second.ts', rowId: 'line-1' }, { filename: 'index.ts', rowId: 'line-1' }] });
    expect(mixed.lastDecision).toMatchObject({ precision: 'mixed', bonusApplied: false });
    expect(() => resolveDecisionSelection(normalizePullRequest(a), { selectedLines: [1] })).toThrow('ambiguous');
  });

  it('treats untagged buggy rejections as correct without false-positive or precision credit', () => {
    const a = makePR('a');
    a.bugPatterns = [{ kind: 'logic', severity: 'minor', lineNumbers: [1] }];
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, { type: 'REVIEW_PR', prId: a.id, verdict: 'request-changes', selectedRefs: [] });
    expect(next.lastDecision).toMatchObject({ outcome: 'correct-rejection', precision: 'untagged', correct: true });
    expect(next.counters).toMatchObject({ prsRejected: 1, truePositives: 0, falsePositives: 0 });
    expect(next.falsePositiveRecords).toEqual([]);
    expect(next.prodIncidents).toEqual([]);
  });

  it('resets the decision ledger for a new day or restart while preserving the intended meter policy', () => {
    const a = makePR('a');
    const reviewed = gameReducer(workState({ queue: [a], currentPR: a, meters: { stability: 70, velocity: 70, satisfaction: 70 } }), {
      type: 'REVIEW_PR', prId: a.id, verdict: 'approve', selectedRefs: []
    });
    const nextDay = gameReducer(reviewed, { type: 'RESET_FOR_DAY', nextDay: 2, mantra: getDayMantra() });
    expect(nextDay.lastDecision).toBeNull();
    expect(nextDay.decisionReceipts).toEqual([]);
    expect(nextDay.meters).toEqual(reviewed.meters);
    const restarted = gameReducer(reviewed, { type: 'RESET_GAME' });
    expect(restarted.lastDecision).toBeNull();
    expect(restarted.decisionReceipts).toEqual([]);
    expect(restarted.meters).toEqual({ stability: 100, velocity: 100, satisfaction: 100 });
  });

  it('adapts unambiguous legacy selections and copies explicit references', () => {
    const pr = normalizePullRequest(makePR('a'));
    expect(resolveDecisionSelection(pr, { selectedLines: [1] })).toEqual([{ filename: 'index.ts', rowId: 'line-1' }]);
    expect(() => resolveDecisionSelection(pr, { selectedLines: [999] })).toThrow('Missing');
    const refs = [{ filename: 'index.ts', rowId: 'line-1' }];
    const selected = resolveDecisionSelection(pr, { selectedRefs: refs });
    expect(selected).toEqual(refs);
    expect(selected[0]).not.toBe(refs[0]);
  });

  it('ignores off-phase, stale, absent and invalid decisions without partial records', () => {
    const a = makePR('a');
    const b = makePR('b');
    const state = workState({ queue: [a, b], currentPR: a });
    const action = { type: 'REVIEW_PR', prId: a.id, verdict: 'approve' } as const;
    for (const phase of ['BRIEFING', 'SUMMARY', 'GAME_OVER'] as const) {
      const inactive = { ...state, phase };
      expect(gameReducer(inactive, { ...action, selectedRefs: [] })).toBe(inactive);
    }
    expect(gameReducer(state, { ...action, prId: b.id, selectedRefs: [] })).toBe(state);
    expect(gameReducer(state, { ...action, selectedRefs: [{ filename: 'missing.ts', rowId: 'line-1' }] })).toBe(state);
    const absent = { ...state, queue: [] };
    expect(gameReducer(absent, { ...action, selectedRefs: [] })).toBe(absent);
    const processed = gameReducer(state, { ...action, selectedRefs: [] });
    expect(gameReducer(processed, { type: 'QUEUE_PRS', prs: [a, b] })).toBe(processed);
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

  it('records a clean rejection and false-positive count atomically', () => {
    const a = makePR('a');
    const state = workState({ queue: [a], currentPR: a });
    const next = gameReducer(state, {
      type: 'REVIEW_PR', prId: a.id, verdict: 'request-changes', selectedRefs: [{ filename: 'index.ts', rowId: 'line-1' }]
    });
    expect(next.counters.falsePositives).toBe(state.counters.falsePositives + 1);
    expect(next.counters.prsRejected).toBe(state.counters.prsRejected + 1);
    expect(next.counters.truePositives).toBe(state.counters.truePositives);
    expect(next.falsePositiveRecords).toEqual([{
      prId: a.id, title: a.title, author: a.author, actualBugKinds: [],
      selectedLines: [{ filename: 'index.ts', rowId: 'line-1', lineNumber: 1, content: 'const value = 1;' }]
    }]);
    expect(next.lastDecision?.outcome).toBe('false-positive');
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
      type: 'REVIEW_PR',
      prId: a.id, verdict: 'request-changes', selectedRefs: []
    });
    expect(next.phase).toBe('GAME_OVER');
    expect(next.gameOverReason).toBe('velocity');
  });
});
