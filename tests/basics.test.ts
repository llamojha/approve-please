import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { basicsExercises, basicsLessons } from '../data/basics';
import { characters } from '../data/characters';
import { diffText, evidenceKeys, expectedVerdict, rowKey } from '../utils/basics';
import { BASICS_WAVES, basicsDay, basicsWaveMarker, makeBasicsPR, localizeBasicsPR, pendingBasicsWaves } from '../utils/basicsGame';
import { createInitialState, gameReducer } from '../context/GameContext';
import { normalizePullRequest } from '../utils/templateNormalization';
import { evaluateDecision } from '../utils/decision';
import { BASICS_RUN_SAVE_STORAGE_KEY, RUN_SAVE_STORAGE_KEY, readSavedRun, writeSavedRun, clearSavedRun } from '../utils/runPersistence';
import { validateTemplate } from '../lib/templates/validation.mjs';
import CodeDiff from '../components/work/CodeDiff';

describe('beginner shift content', () => {
  it('has six shifts of ten PRs, balanced verdicts and the full cast', () => {
    expect(basicsLessons).toHaveLength(6);
    expect(basicsExercises).toHaveLength(60);
    expect(new Set(basicsExercises.map(item => item.id)).size).toBe(60);
    expect(basicsExercises.filter(item => expectedVerdict(item) === 'approve')).toHaveLength(30);
    for (const day of basicsLessons) {
      expect(day.exercises).toHaveLength(10);
      expect(day.exercises.filter(item => item.issues.length > 0)).toHaveLength(5);
    }
    for (const person of characters) {
      const work = basicsExercises.filter(item => item.authorId === person.id);
      expect(work).toHaveLength(6);
      expect(work.some(item => item.issues.length > 0)).toBe(true);
      expect(work.some(item => item.issues.length === 0)).toBe(true);
    }
    expect(basicsDay(7)).toBeUndefined();
  });
  for (const exercise of basicsExercises) {
    it(`${exercise.id}: produces a valid, bilingual PR for the real engine`, () => {
      for (const locale of ['en','es'] as const) {
        const pr = makeBasicsPR(exercise,1,1,locale,0);
        expect(validateTemplate(pr)).toEqual([]);
        const normalized = normalizePullRequest(pr);
        expect(exercise.brief[locale].length).toBeGreaterThan(20);
        expect(pr.learningContext?.explanation).toBe(exercise.explanation[locale]);
        expect(pr.description).toBe(exercise.brief[locale]);
        const changed = new Set<string>();
        for (const file of exercise.files) {
          expect(file.filename.endsWith('.txt')).toBe(true);
          const rows = diffText(file.before[locale],file.after[locale]);
          expect(rows.filter(row => row.kind !== 'addition').map(row => row.content)).toEqual(file.before[locale]);
          expect(rows.filter(row => row.kind !== 'removal').map(row => row.content)).toEqual(file.after[locale]);
          rows.filter(row => row.kind !== 'context').forEach(row => changed.add(rowKey(file.filename,row.id)));
        }
        for (const key of evidenceKeys(exercise)) expect(changed.has(key), key).toBe(true);
        const refs = normalized.bugPatterns.flatMap(item => item.lineRefs);
        expect(evaluateDecision(normalized,expectedVerdict(exercise),refs,{stability:100,velocity:100,satisfaction:100}).correct).toBe(true);
        const switched = localizeBasicsPR(pr,locale === 'en' ? 'es' : 'en');
        expect(switched.id).toBe(pr.id);
        expect(switched.importance).toBe(pr.importance);
        expect(switched.bugPatterns.map(item => item.lineRefs)).toEqual(pr.bugPatterns.map(item => item.lineRefs));
      }
    });
  }
  it('renders removed lines in the shared game diff and awards accurate rejection credit', () => {
    const pr = normalizePullRequest(makeBasicsPR(basicsExercises.find(item => item.id === 'replace-roster')!,1,1,'en',0));
    const refs = pr.bugPatterns[0].lineRefs;
    const row = pr.files[0].lines.find(line => line.rowId === refs[0].rowId)!;
    expect(row.kind).toBe('removal'); expect(row.isNew).toBe(false);
    expect(evaluateDecision(pr,'request-changes',refs,{stability:100,velocity:100,satisfaction:100}).bonusApplied).toBe(true);
    const html = renderToStaticMarkup(createElement(CodeDiff,{files:pr.files,selected:[],onToggle:()=>undefined,labels:{codeLabel:'Diff',select:'Flag',additions:'added',language:'Language'}}));
    expect(html).toContain('− Inés');
    expect(html).toContain('/ −1');
    expect(html).not.toContain('learningContext');
  });
});

describe('the actual shift engine with beginner content', () => {
  it('delivers the next scheduled batch at 10:00, or earlier when the inbox is cleared', () => {
    const opening = [basicsWaveMarker(1,BASICS_WAVES[0])];
    expect(pendingBasicsWaves(1,0,[],true)).toEqual([BASICS_WAVES[0]]);
    expect(pendingBasicsWaves(1,1,opening,false)).toEqual([]);
    expect(pendingBasicsWaves(1,1,opening,true)).toEqual([BASICS_WAVES[1]]);
    expect(pendingBasicsWaves(1,60,opening,false)).toEqual([BASICS_WAVES[1]]);
    // Old saves use the same 90 marker even though the batch now arrives at minute 60.
    expect(pendingBasicsWaves(1,60,['basics:1:0','basics:1:90'],false)).toEqual([]);
    expect(pendingBasicsWaves(1,60,BASICS_WAVES.map(wave=>basicsWaveMarker(1,wave)),true)).toEqual([]);
  });
  it('lets a fast player clear ten PRs without waiting and ends only a completed beginner shift', () => {
    let state = {...createInitialState('basics'),phase:'WORK' as const} as ReturnType<typeof createInitialState>;
    expect(gameReducer(state,{type:'FINISH_BASICS_SHIFT'})).toBe(state);
    for (let batch=0;batch<4;batch++) {
      const due = pendingBasicsWaves(1,state.currentTime,state.deliveryMarkers,state.queue.length===0);
      expect(due).toHaveLength(1);
      const wave = due[0];
      const prs = basicsDay(1)!.exercises.slice(wave.start,wave.end).map((item,index)=>makeBasicsPR(item,1,state.runId,'en',wave.start+index));
      state = gameReducer(state,{type:'DELIVER_PRS',marker:basicsWaveMarker(1,wave),prs});
      expect(gameReducer(state,{type:'FINISH_BASICS_SHIFT'})).toBe(state);
      for (const pr of prs) state = gameReducer(state,{type:'REVIEW_PR',prId:pr.id,verdict:pr.bugPatterns.length?'request-changes':'approve',selectedRefs:pr.bugPatterns.flatMap(item=>item.lineRefs??[])});
    }
    expect(state.decisionReceipts).toHaveLength(10);
    expect(new Set(state.decisionReceipts.map(receipt=>receipt.prId)).size).toBe(10);
    expect(gameReducer({...state,simulationPaused:true},{type:'FINISH_BASICS_SHIFT'}).phase).toBe('WORK');
    expect(gameReducer({...state,contentTrack:'code'},{type:'FINISH_BASICS_SHIFT'}).phase).toBe('WORK');
    const finished = gameReducer(state,{type:'FINISH_BASICS_SHIFT'});
    expect(finished.phase).toBe('SUMMARY'); expect(finished.currentTime).toBe(0);
    expect(gameReducer(finished,{type:'FINISH_BASICS_SHIFT'})).toBe(finished);
  });
  it('plays all 60 through six timed shifts, with atomic wave delivery and normal summaries', () => {
    let state = createInitialState('basics');
    expect(state.difficulty).toBe('learning'); expect(state.leaderboardEligible).toBe(false);
    const reviewed = new Set<string>();
    for (let day = 1; day <= 6; day++) {
      state = gameReducer(state,{type:'SET_PHASE',phase:'WORK'});
      for (const wave of BASICS_WAVES) {
        state = gameReducer(state,{type:'ADVANCE_TIME',minutes:wave.minute - state.currentTime});
        const prs = basicsDay(day)!.exercises.slice(wave.start,wave.end).map((item,index) => makeBasicsPR(item,day,state.runId,'en',wave.start + index));
        const action = {type:'DELIVER_PRS' as const,marker:basicsWaveMarker(day,wave),prs};
        state = gameReducer(state,action);
        expect(gameReducer(state,action)).toBe(state);
        for (const pr of prs) {
          state = gameReducer(state,{type:'REVIEW_PR',prId:pr.id,verdict:pr.bugPatterns.length ? 'request-changes' : 'approve',selectedRefs:pr.bugPatterns.flatMap(item => item.lineRefs ?? [])});
          reviewed.add(pr.templateId);
        }
      }
      expect(state.queue).toHaveLength(0); expect(state.decisionReceipts).toHaveLength(10);
      expect(state.decisionReceipts.every(receipt => receipt.correct && receipt.learningContext?.explanation)).toBe(true);
      state = gameReducer(state,{type:'ADVANCE_TIME',minutes:480 - state.currentTime});
      expect(state.phase).toBe('SUMMARY');
      if (day < 6) state = gameReducer(state,{type:'RESET_FOR_DAY',nextDay:day+1,mantra:state.currentMantra});
      expect(state.contentTrack).toBe('basics');
    }
    expect(reviewed.size).toBe(60);
    const restarted = gameReducer(state,{type:'RESET_GAME'});
    expect(restarted.contentTrack).toBe('basics'); expect(restarted.currentDay).toBe(1); expect(restarted.leaderboardEligible).toBe(false);
  });
  it('keeps consequences, pressure, pause and replay protection from the original game', () => {
    const pr = makeBasicsPR(basicsExercises.find(item => item.id === 'replace-roster')!,1,1,'en',0);
    const initial = {...createInitialState('basics'),phase:'WORK' as const,queue:[pr],currentPR:pr};
    const reviewed = gameReducer(initial,{type:'REVIEW_PR',prId:pr.id,verdict:'approve',selectedRefs:[]});
    expect(reviewed.meters.stability).toBeLessThan(initial.meters.stability);
    expect(reviewed.prodIncidents).toHaveLength(1);
    expect(gameReducer(reviewed,{type:'REVIEW_PR',prId:pr.id,verdict:'approve',selectedRefs:[]})).toBe(reviewed);
    expect(gameReducer(initial,{type:'ADVANCE_TIME',minutes:1}).meters).toEqual(initial.meters);
    expect(gameReducer({...initial,difficulty:'normal'},{type:'ADVANCE_TIME',minutes:1}).meters.velocity).toBeLessThan(initial.meters.velocity);
    expect(gameReducer({...initial,simulationPaused:true},{type:'ADVANCE_TIME',minutes:1}).currentTime).toBe(0);
  });
  it('isolates the two saved runs and preserves older code saves', () => {
    const data = new Map<string,string>();
    const storage = {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)};
    const code = {...createInitialState(),currentTime:21};
    const pr = makeBasicsPR(basicsExercises[0],1,1,'es',0);
    const beginner = {...createInitialState('basics'),phase:'WORK' as const,currentTime:37,queue:[pr],currentPR:pr};
    writeSavedRun(storage,code); writeSavedRun(storage,beginner,new Date(),BASICS_RUN_SAVE_STORAGE_KEY);
    expect(readSavedRun(storage)?.state).toMatchObject({contentTrack:'code',currentTime:21});
    expect(readSavedRun(storage,BASICS_RUN_SAVE_STORAGE_KEY)?.state).toMatchObject({contentTrack:'basics',currentTime:37,currentPR:pr});
    clearSavedRun(storage,BASICS_RUN_SAVE_STORAGE_KEY);
    expect(readSavedRun(storage)?.state.currentTime).toBe(21);
    const legacy = JSON.parse(data.get(RUN_SAVE_STORAGE_KEY)!); delete legacy.state.contentTrack;
    data.set(RUN_SAVE_STORAGE_KEY,JSON.stringify(legacy));
    expect(readSavedRun(storage)?.state.contentTrack).toBe('code');
  });
});
