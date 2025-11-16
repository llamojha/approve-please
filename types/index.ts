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

export interface PullRequestTemplate extends Omit<PullRequest, 'id' | 'estimatedReviewSeconds'> {}

export interface DayQuote {
  speaker: string;
  role: string;
  text: string;
}

export type LanguagePreference = 'any' | string;

export interface Rule {
  id: string;
  description: string;
  appliesTo: BugKind[] | 'any';
}

export interface SpawnWave {
  atMinute: number; // minutes from 9:00
  count: number;
  note?: string;
}

export interface ScriptedWave {
  atMinute: number;
  templateIds: string[];
  note?: string;
}

export interface DayConfig {
  day: number;
  codename: string;
  mood: string;
  briefing: string;
  rules: Rule[];
  spawn: {
    waves: SpawnWave[];
    pool: string[]; // references PR template ids
    scriptedWaves?: ScriptedWave[];
    targetQueueSeconds?: number;
    dynamicCadenceMinutes?: number;
  };
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
  briefing: string;
}
