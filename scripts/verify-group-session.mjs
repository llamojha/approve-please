import assert from 'node:assert/strict';

const args=process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/verify-group-session.mjs --base-url http://127.0.0.1:3120\nExercises a local development server with GROUP_SESSION_STORE=memory; creates disposable rooms.');
  process.exit(0);
}
const base=args[0]==='--base-url' && args.length===2 ? new URL(args[1]) : null;
if (!base || !['127.0.0.1','localhost'].includes(base.hostname) || base.protocol!=='http:') throw new Error('Pass --base-url with a local HTTP development server.');
const client=()=>{
  const jar=new Map();
  return async(path,body,expectedStatus=200)=>{
    const response=await fetch(new URL(path,base),{method:body?'POST':'GET',headers:{Origin:base.origin,'Content-Type':'application/json',Cookie:[...jar].map(([key,value])=>`${key}=${value}`).join('; ')},...(body?{body:JSON.stringify(body)}:{})});
    for (const cookie of response.headers.getSetCookie()) {const pair=cookie.split(';')[0];const index=pair.indexOf('=');jar.set(pair.slice(0,index),pair.slice(index+1));}
    const result=await response.json();
    assert.equal(response.status,expectedStatus,JSON.stringify(result));
    assert.match(response.headers.get('cache-control'),/no-store/);
    return result;
  };
};
const host=client(),alice=client(),bob=client(),visitor=client();
const room=await host('/api/group-sessions',{track:'basics',day:1,locale:'en',durationSeconds:120},201);
const path=`/api/group-sessions/${room.code}`;
assert.equal(room.role,'host');
await Promise.all([alice(path,{action:'join',name:'Alice'}),bob(path,{action:'join',name:'Bob'})]);
assert.equal((await host(path)).players.length,2);
await alice(path,{action:'start'},403);
await host(path,{action:'start'});
const aliceWork=await alice(path),bobWork=await bob(path);
assert.deepEqual(aliceWork.queue.map(pr=>pr.id),bobWork.queue.map(pr=>pr.id));
assert.equal(aliceWork.queue.length,10);assert.deepEqual(aliceWork.results,[]);
for (const pr of aliceWork.queue) {
  assert.deepEqual(pr.bugPatterns,[]);assert.equal(pr.learningContext,undefined);assert.equal(pr.reactions,undefined);
}
await visitor(path,undefined,403);
const safe=new Set(['basics-add-member','basics-add-break','basics-remove-duplicate','basics-opening-hours','basics-meeting-title']);
for (const pr of aliceWork.queue) {
  const verdict=safe.has(pr.templateId)?'approve':'request-changes';
  const action={action:'review',prId:pr.id,verdict,selectedRefs:[]};
  await alice(path,action);await alice(path,action); // A network retry must not count twice.
}
const waiting=await alice(path);assert.equal(waiting.phase,'playing');assert.equal(waiting.queue.length,0);assert.equal(waiting.me.reviewedIds.length,10);assert.deepEqual(waiting.results,[]);
// Bob reviews only three, including one deliberate wrong decision, before the host ends the day.
for (const [index,pr] of bobWork.queue.slice(0,3).entries()) {
  const correct=safe.has(pr.templateId)?'approve':'request-changes';
  await bob(path,{action:'review',prId:pr.id,verdict:index===0?(correct==='approve'?'request-changes':'approve'):correct,selectedRefs:[]});
}
await bob(path,{action:'finish'},403);await host(path,{action:'finish'});
const results=await alice(path),bobResults=await bob(path);
assert.equal(results.phase,'finished');assert.deepEqual(results.results.map(row=>row.correct),[10,2]);
assert.equal(results.results[1].reviewed,3);assert.equal(results.reviews.length,10);assert.equal(bobResults.reviews.length,3);
assert.equal(results.recap.length,10);assert.equal((await host(path)).reviews.length,0);
const codeRoom=await host('/api/group-sessions',{track:'code',day:1,locale:'es',durationSeconds:120},201);
await bob(`/api/group-sessions/${codeRoom.code}`,{action:'join',name:'Diego'});
await host(`/api/group-sessions/${codeRoom.code}`,{action:'start'});
const codeWork=await bob(`/api/group-sessions/${codeRoom.code}`);assert.equal(codeWork.queue.length,10);assert.equal(codeWork.settings.track,'code');
console.log('PASS: real HTTP create/join/start, concurrent seats, private answers, duplicate retries, reconnect, server scoring, waiting, host-only finish, group and personal results, and Spanish code-review room.');
