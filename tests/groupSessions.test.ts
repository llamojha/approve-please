import { describe, expect, it, vi } from 'vitest';
import { applyCommand, createRoom, GroupError, parseSettings, snapshotRoom, tokenHash } from '../server/groupSessions';
import { createMemoryRoomStore, getRoomStore, transactRoom } from '../server/groupSessionStore';
import type { GroupRoom } from '../server/groupSessions';

const now=1_000_000;
const settings={track:'basics',day:1,locale:'en',durationSeconds:120} as const;
const create=()=>createRoom({...settings},'host-secret',now);
const join=(room:GroupRoom,seat='seat-one',name='Lucía')=>applyCommand(room,{action:'join',name},{seat},now);
const start=(room:GroupRoom)=>applyCommand(room,{action:'start'},{host:'host-secret'},now+1000);
const review=(room:GroupRoom,index:number,seat='seat-one',correct=true)=>{
  const pr=room.prs[index];
  const verdict=(Boolean(pr.bugPatterns.length)===correct) ? 'request-changes':'approve';
  applyCommand(room,{action:'review',prId:pr.id,verdict,selectedRefs:[]},{seat},now+2000+index);
};
const throwsCode=(operation:()=>unknown,code:string)=>{try {operation();throw new Error('Expected GroupError');} catch(error) {expect(error).toBeInstanceOf(GroupError);expect((error as GroupError).code).toBe(code);}};

describe('server-owned group sessions',()=>{
  it('snapshots ten bilingual PRs and stores only credential hashes',async()=>{
    const room=await create();expect(room.prs).toHaveLength(10);expect(room.hostHash).toBe(tokenHash('host-secret'));
    expect(room.expiresAt-now).toBe(86400000);
    const spanish=await createRoom({...settings,day:6,locale:'es'},'host',now);
    expect(spanish.prs).toHaveLength(10);expect(spanish.prs[0].description).not.toBe(room.prs[0].description);
  });
  it('snapshots a balanced code-review set once per room',async()=>{
    const room=await createRoom({...settings,track:'code'},'host',now);
    expect(room.prs).toHaveLength(10);expect(room.prs.filter(pr=>pr.bugPatterns.length)).toHaveLength(5);
    expect(new Set(room.prs.map(pr=>pr.templateId)).size).toBe(10);
  });
  it('rejects malformed settings and normalizes code days',()=>{
    for (const input of [null,{}, {...settings,day:7},{...settings,locale:'fr'},{...settings,durationSeconds:1},{...settings,track:'unknown'}]) throwsCode(()=>parseSettings(input),'invalid_settings');
    expect(parseSettings({...settings,track:'code',day:6}).day).toBe(1);
  });
  it('reconnects the same seat, rejects duplicate names and caps the lobby',async()=>{
    const room=await create();join(room);join(room,'seat-one','different');expect(room.players).toHaveLength(1);
    throwsCode(()=>join(room,'two','LUCÍA'),'name_taken');
    throwsCode(()=>join(room,'two','\u0000'),'invalid_name');
    for(let i=1;i<40;i++) join(room,`seat-${i}`,`Player ${i}`);
    throwsCode(()=>join(room,'extra','Extra'),'room_full');
  });
  it('only lets the host start, never restarts a deadline, and refuses late joins',async()=>{
    const room=await create();throwsCode(()=>start(room),'empty_room');join(room);
    throwsCode(()=>applyCommand(room,{action:'start'},{seat:'seat-one'},now),'host_only');start(room);
    applyCommand(room,{action:'start'},{host:'host-secret'},now+5000);expect(room.startsAt).toBe(now+1000);
    expect(room.endsAt).toBe(now+121000);throwsCode(()=>join(room,'late','Late'),'already_started');
    join(room);expect(room.players).toHaveLength(1);
  });
  it('redacts answer keys and personal data from active snapshots',async()=>{
    const room=await create();join(room);join(room,'seat-two','Diego');start(room);review(room,0);
    const snapshot=snapshotRoom(room,{seat:'seat-two'},now+4000);
    expect(snapshot.queue).toHaveLength(10);expect(snapshot.results).toEqual([]);expect(snapshot.recap).toEqual([]);expect(snapshot.reviews).toEqual([]);
    const serialized=JSON.stringify(snapshot);
    for (const secret of ['credentialHash','hostHash','learningContext','reactions','explanation','matchedBugCount','seat-one']) expect(serialized).not.toContain(secret);
    expect(snapshot.queue.every(pr=>pr.bugPatterns.length===0)).toBe(true);
    const host=snapshotRoom(room,{host:'host-secret'},now+4000);expect(host.queue).toEqual([]);expect(host.me).toBeNull();
    expect(host.players[0].reviewed).toBe(1);
    throwsCode(()=>snapshotRoom(room,{},now+4000),'join_required');
  });
  it('grades on the server and saves the original verdict across retries',async()=>{
    const room=await create();join(room);start(room);review(room,0);review(room,0);
    expect(room.players[0].decisions).toHaveLength(1);expect(room.players[0].decisions[0].correct).toBe(true);
    throwsCode(()=>review(room,0,'seat-one',false),'already_reviewed');
    throwsCode(()=>review(room,1,'impostor'),'join_required');
    throwsCode(()=>applyCommand(room,{action:'review',prId:room.prs[1].id,verdict:'approve',selectedRefs:[{filename:'unknown',rowId:'unknown'}]},{seat:'seat-one'},now+3000),'invalid_review');
    expect(room.players[0].decisions).toHaveLength(1);
  });
  it('rejects a new decision exactly at the shared deadline, regardless of browser time',async()=>{
    const room=await create();join(room);start(room);
    throwsCode(()=>applyCommand(room,{action:'review',prId:room.prs[0].id,verdict:'approve',selectedRefs:[]},{seat:'seat-one'},room.endsAt!),'shift_finished');
    expect(room.players[0].decisions).toHaveLength(0);
    expect(snapshotRoom(room,{seat:'seat-one'},room.endsAt!).phase).toBe('finished');
  });
  it('waits for every player and closes once all ten decisions are saved',async()=>{
    const room=await create();join(room);join(room,'seat-two','Diego');start(room);
    for(let i=0;i<10;i++) review(room,i);
    expect(snapshotRoom(room,{seat:'seat-one'},now+4000).phase).toBe('playing');
    for(let i=0;i<10;i++) review(room,i,'seat-two',i!==0);
    const result=snapshotRoom(room,{seat:'seat-one'},now+4000);
    expect(result.phase).toBe('finished');expect(result.results.map(p=>p.correct)).toEqual([10,9]);
    expect(result.reviews).toHaveLength(10);expect(result.recap).toHaveLength(10);
    expect(result.results[0].correctRejections).toBe(5);expect(result.results[0].precise).toBe(0);
    expect(result.recap.every(pr=>pr.reviewed===2)).toBe(true);
  });
  it('counts unreviewed PRs separately and shares ranks for equal decisions',async()=>{
    const room=await create();join(room);join(room,'two','Diego');start(room);review(room,0);review(room,0,'two');
    throwsCode(()=>applyCommand(room,{action:'finish'},{seat:'two'},now+4000),'host_only');
    applyCommand(room,{action:'finish'},{host:'host-secret'},now+4000);
    const result=snapshotRoom(room,{host:'host-secret'},now+4000);
    expect(result.results.map(p=>p.rank)).toEqual([1,1]);expect(result.results[0].reviewed).toBe(1);expect(result.results[0].correct).toBe(1);
    expect(result.reviews).toEqual([]);expect(result.recap[1].reviewed).toBe(0);
  });
  it('uses precise issue tagging only to break equal-correctness ties',async()=>{
    const room=await create();join(room);join(room,'two','Diego');start(room);
    const index=room.prs.findIndex(pr=>pr.bugPatterns.length>0);const pr=room.prs[index];
    review(room,index,'two');
    applyCommand(room,{action:'review',prId:pr.id,verdict:'request-changes',selectedRefs:pr.bugPatterns[0].lineRefs!},{seat:'seat-one'},now+3000);
    applyCommand(room,{action:'finish'},{host:'host-secret'},now+4000);
    const results=snapshotRoom(room,{host:'host-secret'},now+4000).results;
    expect(results.map(p=>p.correct)).toEqual([1,1]);expect(results.map(p=>p.precise)).toEqual([1,0]);expect(results.map(p=>p.rank)).toEqual([1,2]);
  });
  it('expires room access after 24 hours',async()=>{
    const room=await create();throwsCode(()=>snapshotRoom(room,{host:'host-secret'},room.expiresAt),'room_expired');
  });
});

describe('atomic group storage',()=>{
  it('never enables memory storage or database sessions implicitly in production',()=>{
    vi.stubEnv('NODE_ENV','production');vi.stubEnv('GROUP_SESSION_STORE','memory');vi.stubEnv('GROUP_SESSIONS_ENABLED','false');
    try {throwsCode(()=>getRoomStore(),'sessions_unavailable');} finally {vi.unstubAllEnvs();}
  });
  it('keeps concurrent joins and concurrent reviews, including identical retries',async()=>{
    const store=createMemoryRoomStore();const room=await create();await store.insert(room);
    await Promise.all(Array.from({length:12},(_,index)=>transactRoom(store,room.code,draft=>join(draft,`seat-${index}`,`Player ${index}`))));
    await transactRoom(store,room.code,start);
    await Promise.all(Array.from({length:12},(_,index)=>transactRoom(store,room.code,draft=>review(draft,0,`seat-${index}`))));
    await Promise.all([0,1].map(()=>transactRoom(store,room.code,draft=>review(draft,1,'seat-0'))));
    const stored=(await store.read(room.code))!.state;
    expect(stored.players).toHaveLength(12);expect(stored.players.every(p=>p.decisions.length>=1)).toBe(true);
    expect(stored.players.find(p=>p.name==='Player 0')!.decisions).toHaveLength(2);
  });
  it('does not commit rejected commands or expose mutable storage references',async()=>{
    const store=createMemoryRoomStore();const room=await create();await store.insert(room);
    await expect(transactRoom(store,room.code,start)).rejects.toThrow('empty_room');
    const read=(await store.read(room.code))!;read.state.players.push({} as never);
    expect((await store.read(room.code))!.state.players).toEqual([]);
    await expect(transactRoom(store,'AAAAAA',()=>null)).rejects.toThrow('room_not_found');
  });
});
