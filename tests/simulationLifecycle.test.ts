import { describe, expect, it } from 'vitest';
import { createInitialState, gameReducer } from '../context/GameContext';
import { templateMatchesPreference, tutorialBlocksLaterWave } from '../hooks/usePRSpawner';
import type { PullRequest, PullRequestTemplate } from '../types';

const makePR = (id: string, templateId = `template-${id}`): PullRequest => ({
  id,
  templateId,
  title: id,
  author: 'Tester',
  description: '',
  tags: [],
  importance: 'normal',
  estimatedReviewSeconds: 10,
  files: [{ filename: 'index.ts', language: 'typescript', lines: [{ lineNumber: 1, content: 'ok()', isNew: true }] }],
  bugPatterns: []
});

describe('live simulation lifecycle', () => {
  it('freezes time, queue aging, deliveries and verdicts while paused', () => {
    const pr = makePR('one');
    const working = { ...createInitialState(), phase: 'WORK' as const, queue: [pr], currentPR: pr };
    const paused = gameReducer(working, { type: 'SET_SIMULATION_PAUSED', paused: true });
    expect(paused.simulationPaused).toBe(true);
    expect(gameReducer(paused, { type: 'ADVANCE_TIME', minutes: 1 })).toBe(paused);
    expect(gameReducer(paused, { type: 'QUEUE_PRS', prs: [makePR('late')] })).toBe(paused);
    expect(gameReducer(paused, { type: 'REVIEW_PR', prId: pr.id, verdict: 'approve', selectedRefs: [] })).toBe(paused);
  });

  it('resumes without replaying state and clears pause at a phase boundary', () => {
    const working = { ...createInitialState(), phase: 'WORK' as const };
    const paused = gameReducer(working, { type: 'SET_SIMULATION_PAUSED', paused: true });
    const resumed = gameReducer(paused, { type: 'SET_SIMULATION_PAUSED', paused: false });
    expect(gameReducer(resumed, { type: 'ADVANCE_TIME', minutes: 1 }).currentTime).toBe(1);
    expect(gameReducer(paused, { type: 'SET_PHASE', phase: 'SUMMARY' }).simulationPaused).toBe(false);
  });

  it('keeps generic templates eligible for every language preference', () => {
    const generic: PullRequestTemplate = { ...makePR('generic'), files: [{ filename: 'README.md', language: 'markdown', lines: [] }] };
    const code: PullRequestTemplate = { ...makePR('code'), files: [{ filename: 'index.ts', language: 'typescript', lines: [] }] };
    expect(templateMatchesPreference(generic, ['python'])).toBe(true);
    expect(templateMatchesPreference(code, ['python'])).toBe(false);
    expect(templateMatchesPreference(code, ['typescript'])).toBe(true);
  });

  it('holds later day-one waves until both opening tutorial reviews leave the queue', () => {
    const tutorial = makePR('tutorial', 'pr-000-onboarding-readme-update');
    expect(tutorialBlocksLaterWave(1, 60, [tutorial])).toBe(true);
    expect(tutorialBlocksLaterWave(1, 0, [tutorial])).toBe(false);
    expect(tutorialBlocksLaterWave(2, 60, [tutorial])).toBe(false);
    expect(tutorialBlocksLaterWave(1, 60, [])).toBe(false);
  });
});
