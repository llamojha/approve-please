import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import * as game from '../context/GameContext';
import { LocaleContext } from '../context/LocaleContext';
import SummaryScreen from '../components/screens/SummaryScreen';
import { basicsExercises } from '../data/basics';
import { makeBasicsPR } from '../utils/basicsGame';

afterEach(() => vi.restoreAllMocks());
const render = (state: game.GameState) => {
  // Actions are presentation handlers here; their transitions are exercised through the real reducer in basics.test.ts.
  vi.spyOn(game,'useGameState').mockReturnValue({state,actions:{advanceToNextDay:()=>undefined,restartGame:()=>undefined}} as ReturnType<typeof game.useGameState>);
  return renderToStaticMarkup(createElement(LocaleContext.Provider,{value:{locale:'en',setLocale:()=>undefined}},createElement(SummaryScreen)));
};
describe('beginner summaries in the actual game screen', () => {
  it('explains a wrong approval and distinguishes work left in the inbox', () => {
    const flawed = makeBasicsPR(basicsExercises.find(item=>item.id==='replace-roster')!,1,1,'en',0);
    const pending = makeBasicsPR(basicsExercises.find(item=>item.id==='add-member')!,1,1,'en',1);
    let state = {...game.createInitialState('basics'),phase:'WORK' as const,queue:[flawed,pending],currentPR:flawed} as game.GameState;
    state = game.gameReducer(state,{type:'REVIEW_PR',prId:flawed.id,verdict:'approve',selectedRefs:[]});
    state = game.gameReducer(state,{type:'ADVANCE_TIME',minutes:480});
    const html = render(state);
    expect(html).toContain('You approved');
    expect(html).toContain('Needed a revision');
    expect(html).toContain('Inés was removed.');
    expect(html).toContain('Still in the inbox');
    expect(html).toContain('They were not reviewed or scored.');
    expect(html).toContain('open=""');
    expect(html).not.toContain('Try this PR again');
  });
  it('finishes after six shifts without offering day seven', () => {
    const html = render({...game.createInitialState('basics'),phase:'SUMMARY',currentDay:6});
    expect(html).toContain('Six beginner shifts completed.');
    expect(html).toContain('Start another beginner run');
    expect(html).not.toContain('Continue to Day 7');
  });
  it('keeps the original code-review summary and progression', () => {
    const html = render({...game.createInitialState(),phase:'SUMMARY'});
    expect(html).toContain('Continue to Day 2');
    expect(html).not.toContain('Your shift, reviewed');
    expect(html).not.toContain('Start another beginner run');
  });
});
