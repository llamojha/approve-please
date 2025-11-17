export type BugKind = 'logic' | 'security' | 'performance' | 'style';

export interface BugPattern {
  kind: BugKind;
  lineNumbers: number[];
  severity: 'minor' | 'major' | 'critical';
  description?: string;
}

export interface PRLine {
  lineNumber: number;
  content: string;
  isNew: boolean;
}

export interface PRFileDiff {
  filename: string;
  language: string;
  lines: PRLine[];
}

export interface LineExcerpt {
  lineNumber: number;
  content: string;
}

export interface PullRequest {
  id: string;
  templateId: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  files: PRFileDiff[];
  bugPatterns: BugPattern[];
  importance: 'low' | 'normal' | 'high';
  estimatedReviewSeconds: number;
}

export interface ProdIncident {
  prId: string;
  title: string;
  author: string;
  bugKind: BugKind;
  severity: BugPattern['severity'];
  lines: LineExcerpt[];
  description?: string;
}

export interface FalsePositiveRecord {
  prId: string;
  title: string;
  author: string;
  claimedKind: BugKind;
  selectedLines: LineExcerpt[];
  actualBugKinds: BugKind[];
}

export interface PullRequestTemplate extends Omit<PullRequest, 'id' | 'estimatedReviewSeconds'> {}

export interface DayQuote {
  speaker: string;
  role: string;
  text: string;
}

export type LanguagePreference = 'any' | string;

export interface ScriptedWave {
  atMinute: number;
  templateIds: string[];
  note?: string;
}

export interface MeterSet {
  stability: number;
  velocity: number;
  satisfaction: number;
}

export type GamePhase = 'BRIEFING' | 'WORK' | 'SUMMARY' | 'GAME_OVER';

export interface Counters {
  bugsToProd: number;
  prsApproved: number;
  prsRejected: number;
  truePositives: number;
  falsePositives: number;
}

export interface DaySummary {
  day: number;
  counters: Counters;
  meters: MeterSet;
}
