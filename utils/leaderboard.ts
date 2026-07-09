import type { Difficulty } from '../types';

export interface LeaderboardScoreInput {
  cleanApprovals: number;
  truePositives: number;
  daysPlayed: number;
  mode: Difficulty;
}

export const computeLeaderboardScore = ({ cleanApprovals, truePositives, daysPlayed }: LeaderboardScoreInput) => {
  return cleanApprovals + truePositives + daysPlayed * 5;
};

export const parseNonNegativeInt = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.floor(parsed);
};

export const MAX_LEADERBOARD_STAT = 100_000;

export const parseBoundedInt = (value: unknown): number | null => {
  const parsed = parseNonNegativeInt(value);
  if (parsed === null || parsed > MAX_LEADERBOARD_STAT) {
    return null;
  }
  return parsed;
};

export interface LeaderboardEntryDto {
  displayName: string;
  cleanApprovals: number;
  truePositives: number;
  daysPlayed: number;
  score: number;
  createdAt: string;
}

export const sanitizeDisplayName = (raw: string | undefined) => {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return 'Anonymous reviewer';
  }
  return trimmed.slice(0, 64);
};
