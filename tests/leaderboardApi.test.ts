import { describe, expect, it } from 'vitest';
import { parseMode } from '../pages/api/leaderboard';

// Tests the route's pure parsing layer only — no Next.js server is spun up
// (Vitest runs in the node environment; see plan 003 step 4).
describe('parseMode', () => {
  it('passes valid modes through', () => {
    expect(parseMode('normal')).toBe('normal');
    expect(parseMode('learning')).toBe('learning');
  });

  it('falls back to normal for invalid modes', () => {
    expect(parseMode('hardcore')).toBe('normal');
    expect(parseMode('')).toBe('normal');
    expect(parseMode(undefined)).toBe('normal');
    expect(parseMode(null)).toBe('normal');
    expect(parseMode(123)).toBe('normal');
    expect(parseMode(['learning'])).toBe('normal');
  });
});
