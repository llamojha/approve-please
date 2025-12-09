import type { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceClient } from '../../utils/supabaseClient';
import { computeLeaderboardScore, parseNonNegativeInt, sanitizeDisplayName } from '../../utils/leaderboard';

const TRIM_LIMIT = 100;

type LeaderboardRow = {
  id: string;
  display_name: string;
  clean_approvals: number;
  true_positives: number;
  days_played: number;
  score: number;
  created_at: string;
};

const getClientOrError = (res: NextApiResponse) => {
  const client = getSupabaseServiceClient();
  if (!client) {
    res.status(500).json({ error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
    return null;
  }
  return client;
};

const handleGet = async (_req: NextApiRequest, res: NextApiResponse) => {
  const supabase = getClientOrError(res);
  if (!supabase) return;

  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('display_name, clean_approvals, true_positives, days_played, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(TRIM_LIMIT);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({
    entries: (data ?? []).map((row) => ({
      displayName: row.display_name ?? 'Anonymous reviewer',
      cleanApprovals: row.clean_approvals ?? 0,
      truePositives: row.true_positives ?? 0,
      daysPlayed: row.days_played ?? 0,
      score: row.score ?? 0,
      createdAt: row.created_at
    }))
  });
};

const trimLeaderboard = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('id')
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(TRIM_LIMIT, TRIM_LIMIT + 500);

  if (error || !data || data.length === 0) {
    return;
  }

  await supabase.from('leaderboard_entries').delete().in(
    'id',
    data.map((row) => row.id)
  );
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = getClientOrError(res);
  if (!supabase) return;

  const cleanApprovals = parseNonNegativeInt(req.body?.cleanApprovals);
  const truePositives = parseNonNegativeInt(req.body?.truePositives);
  const daysPlayed = parseNonNegativeInt(req.body?.daysPlayed);
  const displayName = sanitizeDisplayName(req.body?.displayName);

  if (cleanApprovals === null || truePositives === null || daysPlayed === null) {
    res.status(400).json({ error: 'Invalid payload: expected non-negative integers.' });
    return;
  }

  const score = computeLeaderboardScore({ cleanApprovals, truePositives, daysPlayed });

  const { error, data } = await supabase
    .from('leaderboard_entries')
    .insert({
      display_name: displayName,
      clean_approvals: cleanApprovals,
      true_positives: truePositives,
      days_played: daysPlayed,
      score
    })
    .select('id')
    .limit(1)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  await trimLeaderboard(supabase);

  res.status(200).json({ id: data?.id, score });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
