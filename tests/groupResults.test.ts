import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupResults } from '../components/group/GroupResults';
import { LocaleContext } from '../context/LocaleContext';
import { applyCommand, createRoom, snapshotRoom } from '../server/groupSessions';
import type { GroupSnapshot } from '../types/groupSessions';

const result=async()=>{
  const room=await createRoom({track:'basics',day:1,locale:'en',durationSeconds:120},'host',1000);
  applyCommand(room,{action:'join',name:'Lucía'},{seat:'student'},1000);
  applyCommand(room,{action:'start'},{host:'host'},2000);
  const flawed=room.prs.find(pr=>pr.templateId==='basics-replace-roster')!;
  applyCommand(room,{action:'review',prId:flawed.id,verdict:'approve',selectedRefs:[]},{seat:'student'},3000);
  applyCommand(room,{action:'finish'},{host:'host'},4000);
  return room;
};
const render=(room:GroupSnapshot,locale:'en'|'es'='en')=>renderToStaticMarkup(createElement(LocaleContext.Provider,{value:{locale,setLocale:()=>undefined}},createElement(GroupResults,{room})));
describe('group feedback presentation',()=>{
  it('shows the wrong approval, expected rejection and actual removed-line evidence',async()=>{
    const html=render(snapshotRoom(await result(),{seat:'student'},4000));
    for(const text of ['Room leaderboard','Your decision','Correct decision','You approved','✕','Reject','Inés was removed.','roster.txt:1','− Inés','open=""']) expect(html).toContain(text);
    expect(html).toContain('/characters/studies/jonah-concerned.png');
  });
  it('keeps host results group-wide without publishing individual review notes',async()=>{
    const html=render(snapshotRoom(await result(),{host:'host'},4000));
    expect(html).toContain('What did the room catch?');expect(html).not.toContain('Your review notes');expect(html).toContain('Unreviewed');
  });
  it('translates the surrounding results controls',async()=>{
    const html=render(snapshotRoom(await result(),{seat:'student'},4000),'es');
    expect(html).toContain('Clasificación de la sala');expect(html).toContain('Decisión correcta');expect(html).toContain('Líneas para repasar');
  });
});
