import { describe, expect, it } from 'vitest';
import { evaluateDecision } from '../utils/decision';
import { normalizePullRequest } from '../utils/templateNormalization';
import type { PullRequest } from '../types';

const fixture = (): PullRequest => ({
  id: 'pr', templateId: 'template', title: 'Fix', author: 'Guest', description: '', tags: [],
  importance: 'normal', estimatedReviewSeconds: 20,
  files: [{ filename: 'a.ts', language: 'typescript', lines: [
    { lineNumber: 1, content: 'bad()', isNew: true }, { lineNumber: 2, content: 'ok()', isNew: false }
  ] }], bugPatterns: [{ kind: 'logic', severity: 'major', lineNumbers: [1] }]
});
const meters = { stability: 50, velocity: 50, satisfaction: 50 };
const right = { filename: 'a.ts', rowId: 'line-1' };
const wrong = { filename: 'a.ts', rowId: 'line-2' };

describe('pure review evaluation', () => {
  it.each([
    [[], 'untagged', false], [[right], 'precise', true], [[wrong], 'inaccurate', false], [[right, wrong], 'mixed', false]
  ] as const)('separates correct buggy rejection from tagging %#', (selected, precision, bonus) => {
    const result = evaluateDecision(normalizePullRequest(fixture()), 'request-changes', [...selected], meters);
    expect(result.correct).toBe(true); expect(result.precision).toBe(precision);
    expect(result.bonusApplied).toBe(bonus); expect(result.counterDelta.falsePositives).toBeUndefined();
    expect(result.counterDelta.truePositives).toBe(bonus ? 1 : undefined);
    expect(result.appliedMeterDelta).toEqual({ stability: 0, velocity: -3, satisfaction: bonus ? 5 : 0 });
  });
  it.each([[], [right], [wrong], [right, wrong]])('counts clean rejection as false positive', (...selected) => {
    const pr = fixture(); pr.bugPatterns = [];
    const result = evaluateDecision(normalizePullRequest(pr), 'request-changes', selected, meters);
    expect(result.correct).toBe(false); expect(result.counterDelta.falsePositives).toBe(1);
    expect(result.bonusApplied).toBe(false);
  });
  it('preserves approval weights and reports capped actual changes', () => {
    const pr = fixture(); const normalized = normalizePullRequest(pr);
    const result = evaluateDecision(normalized, 'approve', [], { stability: 2, velocity: 99, satisfaction: 1 });
    expect(result.requestedMeterDelta).toEqual({ stability: -12, velocity: 2, satisfaction: -3 });
    expect(result.appliedMeterDelta).toEqual({ stability: -2, velocity: 1, satisfaction: -1 });
    expect(result.counterDelta.bugsToProd).toBe(1);
    pr.bugPatterns = [];
    expect(evaluateDecision(normalizePullRequest(pr), 'approve', [wrong], meters)).toMatchObject({
      correct: true, precision: 'not-applicable', counterDelta: { prsApproved: 1, cleanApprovals: 1 },
      appliedMeterDelta: { stability: 0, velocity: 4, satisfaction: 2 }
    });
  });
  it('does not confuse files and counts matched bugs independently of bonus', () => {
    const pr = fixture(); pr.files.push({ ...pr.files[0], filename: 'b.ts' });
    pr.bugPatterns[0].lineRefs = [right];
    pr.bugPatterns.push({ ...pr.bugPatterns[0], lineRefs: [{ filename: 'b.ts', rowId: 'line-1' }] });
    const result = evaluateDecision(normalizePullRequest(pr), 'request-changes', [right, right], meters);
    expect(result.matchedBugCount).toBe(1); expect(result.totalBugCount).toBe(2);
    expect(result.counterDelta.truePositives).toBe(1);
  });
  it('rejects stale selections and invalid meter state', () => {
    const pr = normalizePullRequest(fixture());
    expect(() => evaluateDecision(pr, 'request-changes', [{ ...right, filename: 'missing' }], meters)).toThrow();
    expect(() => evaluateDecision(pr, 'approve', [], { ...meters, velocity: NaN })).toThrow();
    expect(meters).toEqual({ stability: 50, velocity: 50, satisfaction: 50 });
  });
});
