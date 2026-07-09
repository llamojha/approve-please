import { describe, expect, it } from 'vitest';
import {
  calculateQueueChevronCount,
  calculateQueuePressure,
  clamp,
  formatMeterValue,
  meterColorFromValue,
  minutesToClock
} from '../utils/helpers';
import { QUEUE_AGING_IMPORTANCE_WEIGHT, QUEUE_PRESSURE_CHEVRON_CAP } from '../constants/gameSettings';
import type { PullRequest } from '../types';

const prWithImportance = (importance: PullRequest['importance']): PullRequest => ({
  id: `pr-${importance}`,
  templateId: 'tpl',
  title: 'Test PR',
  author: 'author',
  description: 'desc',
  tags: [],
  files: [],
  bugPatterns: [],
  importance,
  estimatedReviewSeconds: 30
});

describe('clamp', () => {
  it('returns the value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps above the maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('minutesToClock', () => {
  it('starts the shift at 09:00', () => {
    expect(minutesToClock(0)).toBe('09:00');
  });

  it('ends an 8-hour shift at 17:00', () => {
    expect(minutesToClock(480)).toBe('17:00');
  });

  it('pads single-digit minutes', () => {
    expect(minutesToClock(5)).toBe('09:05');
  });
});

describe('formatMeterValue', () => {
  it('keeps a single decimal without trailing zeros', () => {
    expect(formatMeterValue(12.5)).toBe('12.5');
  });

  it('renders integers without decimals', () => {
    expect(formatMeterValue(12)).toBe('12');
  });

  it('rounds to two decimals', () => {
    expect(formatMeterValue(12.345)).toBe('12.35');
  });

  it('rounds values that land on an integer', () => {
    expect(formatMeterValue(99.999)).toBe('100');
  });
});

describe('calculateQueuePressure', () => {
  it('returns 0 for an empty queue', () => {
    expect(calculateQueuePressure([])).toBe(0);
  });

  it('sums importance weights across the queue', () => {
    const queue = [prWithImportance('low'), prWithImportance('normal'), prWithImportance('high')];
    const expected =
      QUEUE_AGING_IMPORTANCE_WEIGHT.low +
      QUEUE_AGING_IMPORTANCE_WEIGHT.normal +
      QUEUE_AGING_IMPORTANCE_WEIGHT.high;
    expect(calculateQueuePressure(queue)).toBeCloseTo(expected, 10);
  });
});

describe('calculateQueueChevronCount', () => {
  it('returns 0 for an empty queue', () => {
    expect(calculateQueueChevronCount([])).toBe(0);
  });

  it('caps at QUEUE_PRESSURE_CHEVRON_CAP', () => {
    const queue = Array.from({ length: 30 }, () => prWithImportance('high'));
    expect(calculateQueueChevronCount(queue)).toBe(QUEUE_PRESSURE_CHEVRON_CAP);
  });
});

describe('meterColorFromValue', () => {
  it('maps 0 to red and 100 to green hues', () => {
    expect(meterColorFromValue(0)).toBe('hsl(0, 70%, 50%)');
    expect(meterColorFromValue(100)).toBe('hsl(120, 70%, 50%)');
  });

  it('clamps out-of-range values', () => {
    expect(meterColorFromValue(-50)).toBe('hsl(0, 70%, 50%)');
    expect(meterColorFromValue(250)).toBe('hsl(120, 70%, 50%)');
  });
});
