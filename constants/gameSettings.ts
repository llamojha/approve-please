import type { PullRequest } from '../types';

const WORK_DAY_MINUTES = 8 * 60; // 9:00 -> 17:00
const WORK_START_MINUTE = 9 * 60;
const REAL_MINUTES_PER_DAY = 2;
const MS_PER_GAME_MINUTE = Math.round((REAL_MINUTES_PER_DAY * 60 * 1000) / WORK_DAY_MINUTES);
const MAX_METER_VALUE = 100;
const MIN_METER_VALUE = 0;

const QUEUE_AGING_IMPORTANCE_WEIGHT: Record<PullRequest['importance'], number> = {
  low: 0.3,
  normal: 0.7,
  high: 1.1
};

const QUEUE_PRESSURE_CHEVRON_CAP = 10;
const QUEUE_AGING_MIN_DRAIN = 0.01;
const QUEUE_AGING_MAX_DRAIN = 1;

const SEVERITY_WEIGHTS = {
  minor: 5,
  major: 12,
  critical: 20
} as const;

const DECISION_EFFECTS = {
  approve: {
    baseCounters: { prsApproved: 1 },
    velocityOnBug: 2,
    velocityOnClean: 4,
    satisfactionOnClean: 2,
    stabilityPenaltyMultiplier: 1,
    satisfactionPenaltyDivisor: 4,
    cleanCounters: { cleanApprovals: 1 }
  },
  requestChanges: {
    baseCounters: { prsRejected: 1 },
    baseMeters: { velocity: -3 },
    hitCounters: { truePositives: 1 },
    hitMeters: { satisfaction: 5 },
    missCounters: {},
    missMeters: {}
  }
} as const;

export const gameSettings = {
  time: {
    workDayMinutes: WORK_DAY_MINUTES,
    workStartMinute: WORK_START_MINUTE,
    realMinutesPerDay: REAL_MINUTES_PER_DAY,
    msPerGameMinute: MS_PER_GAME_MINUTE
  },
  meters: {
    max: MAX_METER_VALUE,
    min: MIN_METER_VALUE
  },
  queue: {
    agingImportanceWeight: QUEUE_AGING_IMPORTANCE_WEIGHT,
    pressureChevronCap: QUEUE_PRESSURE_CHEVRON_CAP,
    agingMinDrain: QUEUE_AGING_MIN_DRAIN,
    agingMaxDrain: QUEUE_AGING_MAX_DRAIN
  },
  scoring: {
    severityWeights: SEVERITY_WEIGHTS,
    decisions: DECISION_EFFECTS
  }
} as const;

export {
  WORK_DAY_MINUTES,
  WORK_START_MINUTE,
  REAL_MINUTES_PER_DAY,
  MS_PER_GAME_MINUTE,
  MAX_METER_VALUE,
  MIN_METER_VALUE,
  QUEUE_AGING_IMPORTANCE_WEIGHT,
  QUEUE_PRESSURE_CHEVRON_CAP,
  QUEUE_AGING_MIN_DRAIN,
  QUEUE_AGING_MAX_DRAIN,
  SEVERITY_WEIGHTS,
  DECISION_EFFECTS
};

export const APPROVAL_EFFECTS = DECISION_EFFECTS.approve;
export const REQUEST_CHANGES_EFFECTS = DECISION_EFFECTS.requestChanges;
