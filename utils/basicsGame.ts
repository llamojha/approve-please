import { basicsLessons, basicsExercises } from '../data/basics';
import type { BasicsExercise } from '../data/basics/types';
import { getCharacter } from '../data/characters';
import type { Locale, PullRequest } from '../types';
import { diffText } from './basics';

export const basicsDay = (day: number) => basicsLessons[day - 1];
export const basicsExercise = (templateId: string) => basicsExercises.find(item => `basics-${item.id}` === templateId);
export const BASICS_WAVES = [
  { minute: 0, key: 0, start: 0, end: 2 }, { minute: 60, key: 90, start: 2, end: 5 },
  { minute: 180, key: 180, start: 5, end: 8 }, { minute: 300, key: 300, start: 8, end: 10 }
];
// Keep delivery identities stable for runs saved before the pacing change.
export const basicsWaveMarker = (day: number, wave: typeof BASICS_WAVES[number]) => `basics:${day}:${wave.key}`;
export const pendingBasicsWaves = (day: number, minute: number, markers: string[], inboxEmpty: boolean) => {
  const pending = BASICS_WAVES.filter(wave => !markers.includes(basicsWaveMarker(day,wave)));
  const due = pending.filter(wave => wave.minute <= minute);
  return due.length ? due : inboxEmpty ? pending.slice(0,1) : [];
};
export const makeBasicsPR = (exercise: BasicsExercise, day: number, runId: number, locale: Locale, index: number): PullRequest => {
  const character = getCharacter(exercise.authorId)!;
  const files = exercise.files.map(file => ({ filename: file.filename, language: 'text',
    lines: diffText(file.before[locale], file.after[locale]).map((row, rowIndex) => ({
      rowId: row.id, lineNumber: rowIndex + 1, content: row.content, kind: row.kind, isNew: row.kind === 'addition'
    })) }));
  const lineRefs = exercise.issues.map(item => ({ filename: item.filename, rowId: `${item.side}:${item.line}` }));
  const lineNumbers = lineRefs.map(ref => files.find(file => file.filename === ref.filename)!.lines.find(row => row.rowId === ref.rowId)!.lineNumber);
  return {
    id: `basics-${exercise.id}-d${day}-r${runId}`, templateId: `basics-${exercise.id}`, title: exercise.title[locale],
    author: character.name, authorId: character.id, description: exercise.brief[locale], tags: [],
    importance: (['low','normal','high'] as const)[index % 3], estimatedReviewSeconds: 35, files,
    bugPatterns: lineRefs.length ? [{ kind: 'logic', severity: 'minor', lineRefs, lineNumbers: [...new Set(lineNumbers)], description: exercise.explanation[locale] }] : [],
    learningContext: { brief: exercise.brief[locale], explanation: exercise.explanation[locale] },
    reactions: {
      'clean-approval': { en: 'Merged. That matches the task.', es: 'Integrado. Coincide con el encargo.' },
      'correct-rejection': { en: 'Good catch. I’ll revise it.', es: 'Bien visto. Lo corregiré.' },
      'buggy-approval': { en: 'That change missed a requirement. Let’s check it in the recap.', es: 'Ese cambio incumplía un requisito. Veámoslo en el resumen.' },
      'false-positive': { en: 'This one matched the brief. Let’s compare it in the recap.', es: 'Este cumplía el encargo. Comparémoslo en el resumen.' }
    }
  };
};
export const localizeBasicsPR = (pr: PullRequest, locale: Locale): PullRequest => {
  const exercise = basicsExercise(pr.templateId);
  if (!exercise) return pr;
  const localized = makeBasicsPR(exercise, 1, 1, locale, 0);
  return { ...pr, title: localized.title, description: localized.description, files: localized.files,
    bugPatterns: localized.bugPatterns, learningContext: localized.learningContext };
};
