import type { CharacterId } from '../characters';
import type { Locale } from '../../types';

export type Copy = Record<Locale, string>;
export interface TextFile { filename: string; before: Record<Locale, string[]>; after: Record<Locale, string[]> }
export interface IssueLocation { filename: string; side: 'before' | 'after'; line: number }
export interface ExerciseDraft {
  id: string; title: Copy; brief: Copy; files: TextFile[]; issues: IssueLocation[]; explanation: Copy;
}
export interface BasicsExercise extends ExerciseDraft { authorId: CharacterId }
export interface BasicsLesson { id: string; title: Copy; focus: Copy; tip: Copy; exercises: BasicsExercise[] }
export const copy = (en: string, es: string): Copy => ({ en, es });
export const textFile = (filename: string, beforeEn: string[], afterEn: string[], beforeEs: string[], afterEs: string[]): TextFile =>
  ({ filename, before: { en: beforeEn, es: beforeEs }, after: { en: afterEn, es: afterEs } });
export const issue = (filename: string, side: IssueLocation['side'], line: number): IssueLocation => ({ filename, side, line });
