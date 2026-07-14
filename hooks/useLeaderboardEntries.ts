import { useEffect, useState } from 'react';
import type { Difficulty } from '../types';
import type { LeaderboardEntryDto } from '../utils/leaderboard';

export interface UseLeaderboardEntriesOptions {
  limit?: number;
  enabled?: boolean;
}

export interface UseLeaderboardEntriesResult {
  entries: LeaderboardEntryDto[];
  loading: boolean;
  error: string | null;
}

export const useLeaderboardEntries = (
  mode: Difficulty,
  options: UseLeaderboardEntriesOptions = {}
): UseLeaderboardEntriesResult => {
  const { limit, enabled = true } = options;
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = limit ? `?mode=${mode}&limit=${limit}` : `?mode=${mode}`;
        const response = await fetch(`/api/leaderboard${query}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load leaderboard');
        }
        if (!alive) return;
        setEntries(payload?.entries ?? []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [mode, limit, enabled]);

  return { entries, loading, error };
};
