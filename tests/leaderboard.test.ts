import { describe, expect, it } from 'vitest';
import {
  MAX_LEADERBOARD_STAT,
  computeLeaderboardScore,
  parseBoundedInt,
  parseNonNegativeInt,
  sanitizeDisplayName
} from '../utils/leaderboard';

describe('computeLeaderboardScore', () => {
  it('scores cleanApprovals + truePositives + daysPlayed * 5', () => {
    expect(
      computeLeaderboardScore({ cleanApprovals: 3, truePositives: 2, daysPlayed: 4, mode: 'normal' })
    ).toBe(3 + 2 + 4 * 5);
  });

  it('ignores mode in the score', () => {
    const input = { cleanApprovals: 1, truePositives: 1, daysPlayed: 1 };
    expect(computeLeaderboardScore({ ...input, mode: 'normal' })).toBe(
      computeLeaderboardScore({ ...input, mode: 'learning' })
    );
  });
});

describe('parseNonNegativeInt', () => {
  it('returns null for negative numbers', () => {
    expect(parseNonNegativeInt(-1)).toBeNull();
    expect(parseNonNegativeInt('-5')).toBeNull();
  });

  it('returns null for NaN and non-numeric strings', () => {
    expect(parseNonNegativeInt(NaN)).toBeNull();
    expect(parseNonNegativeInt('abc')).toBeNull();
  });

  it('returns null for Infinity', () => {
    expect(parseNonNegativeInt(Infinity)).toBeNull();
    expect(parseNonNegativeInt('Infinity')).toBeNull();
  });

  it('floors floats', () => {
    expect(parseNonNegativeInt(2.9)).toBe(2);
    expect(parseNonNegativeInt('7.5')).toBe(7);
  });

  it('parses valid non-negative integers', () => {
    expect(parseNonNegativeInt(0)).toBe(0);
    expect(parseNonNegativeInt('42')).toBe(42);
  });

  // parseNonNegativeInt itself stays unbounded; the API route now uses
  // parseBoundedInt (plan 003) to cap magnitudes.
  it('accepts unbounded magnitudes (bounding lives in parseBoundedInt)', () => {
    expect(parseNonNegativeInt(1e15)).toBe(1e15);
  });
});

describe('parseBoundedInt', () => {
  it('rejects values above MAX_LEADERBOARD_STAT', () => {
    expect(parseBoundedInt(MAX_LEADERBOARD_STAT + 1)).toBeNull();
    expect(parseBoundedInt(1e15)).toBeNull();
    expect(parseBoundedInt('100001')).toBeNull();
  });

  it('accepts values at or below MAX_LEADERBOARD_STAT', () => {
    expect(parseBoundedInt(MAX_LEADERBOARD_STAT)).toBe(MAX_LEADERBOARD_STAT);
    expect(parseBoundedInt(0)).toBe(0);
    expect(parseBoundedInt('42')).toBe(42);
  });

  it('keeps parseNonNegativeInt rejections', () => {
    expect(parseBoundedInt(-1)).toBeNull();
    expect(parseBoundedInt(NaN)).toBeNull();
    expect(parseBoundedInt(Infinity)).toBeNull();
    expect(parseBoundedInt('abc')).toBeNull();
  });

  it('floors floats within bounds', () => {
    expect(parseBoundedInt(2.9)).toBe(2);
  });
});

describe('sanitizeDisplayName', () => {
  it('falls back to Anonymous reviewer for empty or whitespace input', () => {
    expect(sanitizeDisplayName(undefined)).toBe('Anonymous reviewer');
    expect(sanitizeDisplayName('')).toBe('Anonymous reviewer');
    expect(sanitizeDisplayName('   ')).toBe('Anonymous reviewer');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeDisplayName('  reviewer  ')).toBe('reviewer');
  });

  it('truncates to 64 characters', () => {
    const long = 'x'.repeat(100);
    expect(sanitizeDisplayName(long)).toBe('x'.repeat(64));
  });
});
