import {
  WORK_START_MINUTE,
  QUEUE_AGING_IMPORTANCE_WEIGHT,
  QUEUE_PRESSURE_CHEVRON_CAP
} from '../constants/game';
import type { PullRequest } from '../types';

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const minutesToClock = (minutesIntoShift: number): string => {
  const absoluteMinutes = WORK_START_MINUTE + minutesIntoShift;
  const hours = Math.floor(absoluteMinutes / 60) % 24;
  const minutes = absoluteMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const uniqueId = (prefix: string) => {
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${random}`;
};

export const formatMeterValue = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(2).replace(/\.?0+$/, '');
};

export const calculateQueuePressure = (queue: PullRequest[]): number => {
  return queue.reduce((total, pr) => {
    const weight = QUEUE_AGING_IMPORTANCE_WEIGHT[pr.importance] ?? 1;
    return total + weight;
  }, 0);
};

export const calculateQueueChevronCount = (queue: PullRequest[]): number => {
  const pressure = calculateQueuePressure(queue);
  if (pressure <= 0) {
    return 0;
  }
  return Math.min(QUEUE_PRESSURE_CHEVRON_CAP, Math.round(pressure));
};

export const meterColorFromValue = (value: number): string => {
  const clampedValue = clamp(value, 0, 100);
  const hue = (clampedValue / 100) * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 70%, 50%)`;
};
