import type { PullRequest } from '../types';

export const WORK_DAY_MINUTES = 8 * 60; // 9:00 -> 17:00
export const WORK_START_MINUTE = 9 * 60;
export const REAL_MINUTES_PER_DAY = 2;
export const MS_PER_GAME_MINUTE = Math.round((REAL_MINUTES_PER_DAY * 60 * 1000) / WORK_DAY_MINUTES);
export const MAX_METER_VALUE = 100;
export const MIN_METER_VALUE = 0;

export const QUEUE_AGING_IMPORTANCE_WEIGHT: Record<PullRequest['importance'], number> = {
  low: 0.5,
  normal: 1,
  high: 2
};

export const QUEUE_PRESSURE_CHEVRON_CAP = 10;
export const QUEUE_AGING_MIN_DRAIN = 0.01;
export const QUEUE_AGING_MAX_DRAIN = 1;
