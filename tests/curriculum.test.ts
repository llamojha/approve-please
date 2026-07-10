// SPIKE (plan 010): tests for the learning-mode curriculum prototype.
// Delete together with utils/curriculum.ts if the direction is rejected.
import { describe, expect, it } from 'vitest';
import { inferTier, orderForLearning } from '../utils/curriculum';
import type { BugPattern, PullRequestTemplate } from '../types';

const makeTemplate = (
  templateId: string,
  bugs: Partial<BugPattern>[] = []
): PullRequestTemplate => ({
  templateId,
  title: templateId,
  author: 'Testy McTestface',
  description: 'handcrafted template for curriculum tests',
  tags: [],
  importance: 'normal',
  files: [],
  bugPatterns: bugs.map((bug) => ({
    kind: 'logic',
    lineNumbers: [1],
    severity: 'major',
    ...bug
  }))
});

// Doc rule 1: clean PRs are tier 1.
const clean = (id = 'clean') => makeTemplate(id);
// Doc rule 2: all-minor PRs are tier 1.
const minorStyle = (id = 'minor-style') =>
  makeTemplate(id, [{ kind: 'style', severity: 'minor' }]);
// Doc rule 5: major logic/style/accessibility are tier 2.
const majorLogic = (id = 'major-logic') =>
  makeTemplate(id, [{ kind: 'logic', severity: 'major' }]);
// Doc rule 3: any critical is tier 3.
const criticalLogic = (id = 'critical-logic') =>
  makeTemplate(id, [{ kind: 'logic', severity: 'critical' }]);
// Doc rule 4: subtle kinds (security/performance) are tier 3.
const majorSecurity = (id = 'major-security') =>
  makeTemplate(id, [{ kind: 'security', severity: 'major' }]);

describe('inferTier', () => {
  it('rule 1: no bugPatterns -> tier 1', () => {
    expect(inferTier(clean())).toBe(1);
  });

  it('rule 2: all severities minor -> tier 1 (regardless of kind)', () => {
    expect(inferTier(minorStyle())).toBe(1);
    expect(
      inferTier(makeTemplate('minor-security', [{ kind: 'security', severity: 'minor' }]))
    ).toBe(1);
  });

  it('rule 3: any critical severity -> tier 3', () => {
    expect(inferTier(criticalLogic())).toBe(3);
    expect(
      inferTier(
        makeTemplate('critical-mixed', [
          { kind: 'style', severity: 'minor' },
          { kind: 'logic', severity: 'critical' }
        ])
      )
    ).toBe(3);
  });

  it('rule 4: any security/performance kind (non-minor) -> tier 3', () => {
    expect(inferTier(majorSecurity())).toBe(3);
    expect(
      inferTier(makeTemplate('major-perf', [{ kind: 'performance', severity: 'major' }]))
    ).toBe(3);
  });

  it('rule 5: major logic/style/accessibility -> tier 2', () => {
    expect(inferTier(majorLogic())).toBe(2);
    expect(
      inferTier(makeTemplate('major-style', [{ kind: 'style', severity: 'major' }]))
    ).toBe(2);
    expect(
      inferTier(
        makeTemplate('major-a11y', [{ kind: 'accessibility', severity: 'major' }])
      )
    ).toBe(2);
    expect(
      inferTier(
        makeTemplate('mixed-minor-major', [
          { kind: 'style', severity: 'minor' },
          { kind: 'logic', severity: 'major' }
        ])
      )
    ).toBe(2);
  });
});

describe('orderForLearning', () => {
  it('day 1 returns tier-1 templates only', () => {
    const pool = [
      majorLogic('t2-a'),
      clean('t1-a'),
      criticalLogic('t3-a'),
      minorStyle('t1-b'),
      majorSecurity('t3-b')
    ];
    const ordered = orderForLearning(pool, 1);
    expect(ordered.map((t) => t.templateId)).toEqual(['t1-a', 't1-b']);
    ordered.forEach((t) => expect(inferTier(t)).toBe(1));
  });

  it('day 1 with no tier-1 falls back to the full pool easiest-first', () => {
    const pool = [criticalLogic('t3-a'), majorLogic('t2-a'), majorLogic('t2-b')];
    const ordered = orderForLearning(pool, 1);
    expect(ordered.map((t) => t.templateId)).toEqual(['t2-a', 't2-b', 't3-a']);
  });

  it('day 2 emits every template and drains zero-weight tier 3 last', () => {
    const pool = [
      criticalLogic('t3-a'),
      clean('t1-a'),
      majorLogic('t2-a'),
      majorSecurity('t3-b'),
      minorStyle('t1-b')
    ];
    const ordered = orderForLearning(pool, 2);
    expect(ordered).toHaveLength(pool.length);
    expect(new Set(ordered)).toEqual(new Set(pool));
    const tiers = ordered.map((t) => inferTier(t));
    const firstT3 = tiers.indexOf(3);
    expect(tiers.slice(firstT3)).toEqual([3, 3]);
  });

  it("day 2 prefix approximates the doc's 70/30 tier-1/tier-2 mix", () => {
    const pool = [
      ...Array.from({ length: 14 }, (_, i) => clean(`t1-${i}`)),
      ...Array.from({ length: 6 }, (_, i) => majorLogic(`t2-${i}`))
    ];
    const prefix = orderForLearning(pool, 2).slice(0, 10);
    const t1Count = prefix.filter((t) => inferTier(t) === 1).length;
    expect(t1Count).toBe(7);
    expect(prefix.length - t1Count).toBe(3);
  });

  it('day 5 leads with tier 3 (highest weight)', () => {
    const pool = [clean('t1-a'), majorLogic('t2-a'), criticalLogic('t3-a')];
    const ordered = orderForLearning(pool, 5);
    expect(inferTier(ordered[0])).toBe(3);
  });

  it('days beyond 5 clamp to the day-5 mix', () => {
    const pool = [
      clean('t1-a'),
      minorStyle('t1-b'),
      majorLogic('t2-a'),
      majorLogic('t2-b'),
      criticalLogic('t3-a'),
      majorSecurity('t3-b')
    ];
    expect(orderForLearning(pool, 12).map((t) => t.templateId)).toEqual(
      orderForLearning(pool, 5).map((t) => t.templateId)
    );
  });

  it('is pure: deterministic output and no input mutation', () => {
    const pool = [criticalLogic('t3-a'), clean('t1-a'), majorLogic('t2-a')];
    const snapshot = [...pool];
    const first = orderForLearning(pool, 3);
    const second = orderForLearning(pool, 3);
    expect(first.map((t) => t.templateId)).toEqual(second.map((t) => t.templateId));
    expect(pool).toEqual(snapshot);
  });
});
