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

// Stable, deterministic "#4821"-style ticket number derived from a PR id so the
// inbox and stage headers read like a real PR tool without a real numbering scheme.
export const shortPrNumber = (id: string): string => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return `#${1000 + (hash % 9000)}`;
};

export interface DiffSummary {
  fileCount: number;
  additions: number;
  removals: number;
  language: string;
}

export const summarizeDiff = (pr: PullRequest): DiffSummary => {
  let additions = 0;
  let removals = 0;
  pr.files.forEach((file) => {
    file.lines.forEach((line) => {
      if (line.isNew) {
        additions += 1;
      } else {
        removals += 1;
      }
    });
  });
  return {
    fileCount: pr.files.length,
    additions,
    removals,
    language: pr.files[0]?.language ?? ''
  };
};

export const authorInitials = (author: string): string => {
  const parts = author.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '??';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
