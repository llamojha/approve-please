import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { basicsExercises, basicsLessons } from '../data/basics';
import { characters } from '../data/characters';
import { diffText, evidenceKeys, expectedVerdict, initialBasicsProgress, lessonStats, recordBasicsAttempt, restoreBasicsProgress, rowKey, BASICS_STORAGE_KEY } from '../utils/basics';
import { RUN_SAVE_STORAGE_KEY } from '../utils/runPersistence';
import PlainTextDiff from '../components/basics/PlainTextDiff';

describe('beginner PR content', () => {
  it('ships six lessons of ten unique PRs, balanced verdicts and the full coworker cast', () => {
    expect(basicsLessons).toHaveLength(6);
    expect(basicsExercises).toHaveLength(60);
    expect(new Set(basicsExercises.map(item => item.id)).size).toBe(60);
    expect(basicsExercises.filter(item => expectedVerdict(item) === 'approve')).toHaveLength(30);
    for (const lesson of basicsLessons) {
      expect(lesson.exercises).toHaveLength(10);
      expect(lesson.exercises.filter(item => expectedVerdict(item) === 'request-changes')).toHaveLength(5);
    }
    for (const character of characters) {
      const assigned = basicsExercises.filter(item => item.authorId === character.id);
      expect(assigned).toHaveLength(6);
      expect(assigned.some(item => item.issues.length === 0)).toBe(true);
      expect(assigned.some(item => item.issues.length > 0)).toBe(true);
    }
  });
  for (const exercise of basicsExercises) {
    it(`${exercise.id}: has bilingual plain text and flags actual changed rows in both languages`, () => {
      for (const locale of ['en','es'] as const) {
        expect(exercise.brief[locale].length).toBeGreaterThan(20);
        expect(exercise.explanation[locale].length).toBeGreaterThan(30);
        expect(exercise.title[locale]).toBeTruthy();
        const changed = new Set<string>();
        for (const file of exercise.files) {
          expect(file.filename.endsWith('.txt')).toBe(true);
          const before = file.before[locale]; const after = file.after[locale];
          expect(before).not.toEqual(after);
          const rows = diffText(before,after);
          expect(rows.filter(row => row.kind !== 'addition').map(row => row.content)).toEqual(before);
          expect(rows.filter(row => row.kind !== 'removal').map(row => row.content)).toEqual(after);
          expect(new Set(rows.map(row => row.id)).size).toBe(rows.length);
          rows.filter(row => row.kind !== 'context').forEach(row => changed.add(rowKey(file.filename,row.id)));
        }
        for (const key of evidenceKeys(exercise)) expect(changed.has(key), key).toBe(true);
      }
    });
  }
  it('renders real removals, additions and two line number columns without revealing answers', () => {
    const exercise = basicsExercises.find(item => item.id === 'replace-roster')!;
    const render = (reveal: boolean) => renderToStaticMarkup(createElement(PlainTextDiff, {exercise, locale:'en',selected:[],onToggle:()=>undefined,disabled:reveal,reveal}));
    expect(render(false)).toContain('data-kind="removal"');
    expect(render(false)).toContain('data-kind="addition"');
    expect(render(false)).toContain('Before');
    expect(render(false)).not.toContain('data-evidence="true"');
    expect(render(true)).toContain('data-evidence="true"');
  });
});

describe('learning progress', () => {
  it('keeps a missed first decision in the recap after a correct retry and reload', () => {
    const exercise = basicsExercises.find(item => item.issues.length > 0)!;
    let progress = recordBasicsAttempt(initialBasicsProgress(),exercise,'approve',[]);
    progress = recordBasicsAttempt(progress,exercise,'request-changes',evidenceKeys(exercise));
    const restored = restoreBasicsProgress(JSON.stringify(progress));
    expect(restored.attempts[exercise.id]).toEqual({firstVerdict:'approve',verdict:'request-changes',attempts:2,tagged:evidenceKeys(exercise)});
    expect(lessonStats(basicsLessons.find(item => item.exercises.includes(exercise))!.id,restored)).toEqual({reviewed:1,firstCorrect:0});
  });
  it('supports all 60 decisions and independently tallies every lesson', () => {
    let progress = initialBasicsProgress();
    for (const exercise of basicsExercises) progress = recordBasicsAttempt(progress,exercise,expectedVerdict(exercise),[]);
    const restored = restoreBasicsProgress(JSON.stringify(progress));
    expect(Object.keys(restored.attempts)).toHaveLength(60);
    for (const lesson of basicsLessons) expect(lessonStats(lesson.id,restored)).toEqual({reviewed:10,firstCorrect:10});
    expect(BASICS_STORAGE_KEY).not.toBe(RUN_SAVE_STORAGE_KEY);
  });
  it('rejects corrupt or incompatible progress and sanitizes malformed attempt records', () => {
    for (const raw of ['broken','null','[]',JSON.stringify({...initialBasicsProgress(),version:2}),JSON.stringify({...initialBasicsProgress(),exerciseIndex:-1})]) {
      expect(restoreBasicsProgress(raw)).toEqual(initialBasicsProgress());
    }
    const exercise = basicsExercises[0];
    const progress = recordBasicsAttempt(initialBasicsProgress(),exercise,'approve',['unknown-file|after:99']);
    const restored = restoreBasicsProgress(JSON.stringify({...progress,attempts:{...progress.attempts,unknown:{verdict:'approve'}}}));
    expect(restored.attempts[exercise.id].tagged).toEqual([]);
    expect(Object.keys(restored.attempts)).toEqual([exercise.id]);
    expect(restoreBasicsProgress(JSON.stringify({...progress,attempts:{[exercise.id]:{...progress.attempts[exercise.id],attempts:0}}})).attempts).toEqual({});
  });
});
