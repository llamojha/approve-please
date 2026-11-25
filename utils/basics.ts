import { basicsExercises, basicsLessons } from '../data/basics';
import type { BasicsExercise } from '../data/basics/types';
import type { Locale } from '../types';
import type { ReviewVerdict } from './decision';

export interface TextDiffRow { id: string; kind: 'context' | 'addition' | 'removal'; content: string; before?: number; after?: number }

/** Longest common subsequence keeps unchanged lines visible and makes real removals selectable. */
export const diffText = (before: string[], after: string[]): TextDiffRow[] => {
  const lengths = Array.from({ length: before.length + 1 }, () => Array<number>(after.length + 1).fill(0));
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      lengths[i][j] = before[i] === after[j] ? 1 + lengths[i + 1][j + 1] : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const rows: TextDiffRow[] = [];
  let i = 0; let j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      rows.push({ id: `context:${i + 1}`, kind: 'context', content: before[i], before: ++i, after: ++j });
    } else if (i < before.length && (j === after.length || lengths[i + 1][j] >= lengths[i][j + 1])) {
      rows.push({ id: `before:${i + 1}`, kind: 'removal', content: before[i], before: ++i });
    } else {
      rows.push({ id: `after:${j + 1}`, kind: 'addition', content: after[j], after: ++j });
    }
  }
  return rows;
};
export const rowKey = (filename: string, id: string) => `${filename}|${id}`;
export const expectedVerdict = (exercise: BasicsExercise): ReviewVerdict => exercise.issues.length ? 'request-changes' : 'approve';
export const evidenceKeys = (exercise: BasicsExercise) => exercise.issues.map(item => rowKey(item.filename, `${item.side}:${item.line}`));
export const exerciseRows = (exercise: BasicsExercise, locale: Locale) => exercise.files.flatMap(file =>
  diffText(file.before[locale], file.after[locale]).map(row => rowKey(file.filename, row.id)));

export interface BasicsAttempt { firstVerdict: ReviewVerdict; verdict: ReviewVerdict; attempts: number; tagged: string[] }
export interface BasicsProgress {
  version: 1; introSeen: boolean; lessonId: string; exerciseIndex: number; attempts: Record<string, BasicsAttempt>;
}
export const BASICS_STORAGE_KEY = 'approve-please:git-pr-basics:v1';
export const initialBasicsProgress = (): BasicsProgress => ({ version: 1, introSeen: false, lessonId: basicsLessons[0].id, exerciseIndex: 0, attempts: {} });
const isVerdict = (value: unknown): value is ReviewVerdict => value === 'approve' || value === 'request-changes';

export const restoreBasicsProgress = (raw: string | null): BasicsProgress => {
  const fallback = initialBasicsProgress();
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || typeof value.introSeen !== 'boolean' || !value.attempts || typeof value.attempts !== 'object') return fallback;
    const lesson = basicsLessons.find(item => item.id === value.lessonId);
    if (!lesson || !Number.isInteger(value.exerciseIndex) || value.exerciseIndex < 0 || value.exerciseIndex >= lesson.exercises.length) return fallback;
    const attempts: Record<string, BasicsAttempt> = {};
    for (const exercise of basicsExercises) {
      const saved = value.attempts[exercise.id];
      if (!saved || !isVerdict(saved.firstVerdict) || !isVerdict(saved.verdict) || !Number.isInteger(saved.attempts) || saved.attempts < 1 || saved.attempts > 10000 || !Array.isArray(saved.tagged)) continue;
      const validRows = new Set([...exerciseRows(exercise, 'en'), ...exerciseRows(exercise, 'es')]);
      attempts[exercise.id] = { firstVerdict: saved.firstVerdict, verdict: saved.verdict, attempts: saved.attempts,
        tagged: [...new Set<string>(saved.tagged.filter((key: unknown): key is string => typeof key === 'string' && validRows.has(key)))] };
    }
    return { version: 1, introSeen: value.introSeen, lessonId: lesson.id, exerciseIndex: value.exerciseIndex, attempts };
  } catch { return fallback; }
};

export const recordBasicsAttempt = (progress: BasicsProgress, exercise: BasicsExercise, verdict: ReviewVerdict, tagged: string[]): BasicsProgress => {
  const previous = progress.attempts[exercise.id];
  return { ...progress, attempts: { ...progress.attempts, [exercise.id]: {
    firstVerdict: previous?.firstVerdict ?? verdict, verdict, attempts: Math.min(10000, (previous?.attempts ?? 0) + 1), tagged: [...tagged]
  } } };
};
export const lessonStats = (lessonId: string, progress: BasicsProgress) => {
  const exercises = basicsLessons.find(item => item.id === lessonId)?.exercises ?? [];
  return exercises.reduce((stats, exercise) => {
    const attempt = progress.attempts[exercise.id];
    if (attempt) { stats.reviewed++; if (attempt.firstVerdict === expectedVerdict(exercise)) stats.firstCorrect++; }
    return stats;
  }, { reviewed: 0, firstCorrect: 0 });
};
