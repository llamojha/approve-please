import type { ContentTrack, LineExcerpt, LineReference, Locale, MeterSet, PullRequest } from './index';
import type { ReviewVerdict } from '../utils/decision';

/** Browser contract. Answer keys and seat credentials never belong here. */
export interface GroupSettings {
  track: ContentTrack;
  day: number;
  locale: Locale;
  durationSeconds: 120 | 300 | 600;
}
export interface GroupReview {
  pr: PullRequest;
  verdict: ReviewVerdict;
  correct: boolean;
  precise: boolean;
  explanation: string;
  evidence: LineExcerpt[];
}
export interface GroupResult {
  id: string;
  name: string;
  rank: number;
  reviewed: number;
  correct: number;
  correctApprovals: number;
  correctRejections: number;
  missed: number;
  safeRejected: number;
  precise: number;
}
export interface GroupSnapshot {
  code: string;
  phase: 'lobby' | 'playing' | 'finished';
  settings: GroupSettings;
  serverNow: number;
  startsAt: number | null;
  endsAt: number | null;
  role: 'host' | 'player' | 'visitor';
  players: { id: string; name: string; reviewed: number; finished: boolean }[];
  total: number;
  me: { id: string; name: string; reviewedIds: string[]; meters: MeterSet } | null;
  queue: PullRequest[];
  results: GroupResult[];
  recap: { prId: string; title: string; correct: number; reviewed: number; expected: ReviewVerdict; explanation: string }[];
  reviews: GroupReview[];
}
export type GroupCommand =
  | { action: 'join'; name: string }
  | { action: 'start' }
  | { action: 'finish' }
  | { action: 'review'; prId: string; verdict: ReviewVerdict; selectedRefs: LineReference[] };
