import { WORK_START_MINUTE } from '../constants/game';

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
