export interface LeaderboardScoreInput {
  cleanApprovals: number;
  truePositives: number;
  daysPlayed: number;
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

export const sanitizeDisplayName = (raw: string | undefined) => {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return 'Anonymous reviewer';
  }
  return trimmed.slice(0, 64);
};
