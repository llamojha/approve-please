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
