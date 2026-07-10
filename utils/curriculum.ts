// SPIKE (plan 010): learning-mode curriculum prototype.
//
// This module is throwaway-quality by design — it exists to validate the
// rules in docs/learning-mode-curriculum.md. It is only reachable from the
// `difficulty === 'learning'` branch in hooks/usePRSpawner.ts; normal mode
// never imports its behavior. If the curriculum direction is rejected,
// delete this file, tests/curriculum.test.ts, and the `// SPIKE:` lines in
// the spawner.

import type { PullRequestTemplate } from '../types';

export type CurriculumTier = 1 | 2 | 3;

// Bug kinds that require recognizing a pattern rather than reading the diff
// (see "Inference rules" in docs/learning-mode-curriculum.md, rule 4).
const SUBTLE_KINDS = new Set(['security', 'performance']);

/**
 * Inferred difficulty tier for a template. Implements exactly the ordered
 * rules 1-5 from docs/learning-mode-curriculum.md ("Inference rules"):
 *   1. no bugs                                  -> tier 1
 *   2. all severities minor                     -> tier 1
 *   3. any critical severity                    -> tier 3
 *   4. any security/performance kind            -> tier 3
 *   5. otherwise (major logic/style/a11y)       -> tier 2
 */
export const inferTier = (template: PullRequestTemplate): CurriculumTier => {
  const bugs = template.bugPatterns;
  if (bugs.length === 0) {
    return 1;
  }
  if (bugs.every((bug) => bug.severity === 'minor')) {
    return 1;
  }
  if (bugs.some((bug) => bug.severity === 'critical')) {
    return 3;
  }
  if (bugs.some((bug) => SUBTLE_KINDS.has(bug.kind))) {
    return 3;
  }
  return 2;
};

// Day -> [tier1, tier2, tier3] weights; days beyond 5 clamp to the day-5 row.
// Must stay in sync with the "Progression rules" table in the design doc.
const DAY_MIX: Record<number, [number, number, number]> = {
  1: [1, 0, 0],
  2: [0.7, 0.3, 0],
  3: [0.4, 0.5, 0.1],
  4: [0.2, 0.5, 0.3],
  5: [0.1, 0.4, 0.5],
};

const clampDay = (day: number): number => Math.min(Math.max(day, 1), 5);

/**
 * Orders a template pool for learning-mode day `day`.
 *
 * Pure and deterministic — no randomness inside; relative order within a
 * tier is the incoming order, so callers may pre-shuffle if they want
 * variety. Day 1 returns tier-1 templates only (falling back to the full
 * pool ordered easiest-first if the pool has no tier-1 — waves must always
 * be able to fire). Day 2+ interleaves the tier buckets with a smooth
 * weighted round-robin over the day's weights, so any prefix of the result
 * approximates the day's tier mix; zero-weight tiers drain last.
 */
export const orderForLearning = (
  templates: PullRequestTemplate[],
  day: number
): PullRequestTemplate[] => {
  const buckets: [
    PullRequestTemplate[],
    PullRequestTemplate[],
    PullRequestTemplate[]
  ] = [[], [], []];
  templates.forEach((template) => {
    buckets[inferTier(template) - 1].push(template);
  });

  if (clampDay(day) === 1) {
    if (buckets[0].length > 0) {
      return [...buckets[0]];
    }
    // Fallback: no tier-1 available (thin language preference) — serve the
    // whole pool easiest-first rather than starving the waves.
    return [...buckets[1], ...buckets[2]];
  }

  const weights = DAY_MIX[clampDay(day)];
  const heads = [0, 0, 0];
  const credits = [0, 0, 0];
  const result: PullRequestTemplate[] = [];

  while (result.length < templates.length) {
    let pick = -1;
    for (let i = 0; i < buckets.length; i += 1) {
      if (heads[i] >= buckets[i].length) {
        continue;
      }
      credits[i] += weights[i];
      if (pick === -1 || credits[i] > credits[pick]) {
        pick = i;
      }
    }
    if (pick === -1) {
      break;
    }
    result.push(buckets[pick][heads[pick]]);
    heads[pick] += 1;
    credits[pick] -= 1;
  }

  return result;
};
