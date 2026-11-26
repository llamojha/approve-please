import { describe, expect, it } from 'vitest';
import { normalizeStoredTheme } from '../context/UIPreferencesContext';

describe('UI theme preferences', () => {
  it('uses dark mode for first-time and unknown preferences', () => {
    expect(normalizeStoredTheme(null)).toBe('githob-dark');
    expect(normalizeStoredTheme('unknown')).toBe('githob-dark');
  });

  it('preserves supported and legacy saved preferences', () => {
    expect(normalizeStoredTheme('githob-light')).toBe('githob-light');
    expect(normalizeStoredTheme('default')).toBe('githob-light');
    expect(normalizeStoredTheme('high-contrast')).toBe('githob-dark');
  });
});
