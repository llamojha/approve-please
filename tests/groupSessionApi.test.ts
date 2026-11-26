import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import createHandler from '../pages/api/group-sessions/index';
import roomHandler from '../pages/api/group-sessions/[code]';
import { createMemoryRoomStore } from '../server/groupSessionStore';
import { credentialCookie, roomAuth } from '../server/groupSessionHttp';

const injected=vi.hoisted(()=>({store:null as unknown}));
vi.mock('../server/groupSessionStore',async(importOriginal)=>{
  const actual=await importOriginal<typeof import('../server/groupSessionStore')>();
  return {...actual,getRoomStore:()=>injected.store};
});
const invoke=async(handler:typeof roomHandler,options:Partial<NextApiRequest>={})=>{
  let status=200;let body:Record<string,unknown>={};const headers:Record<string,string|string[]>={};
  const response={setHeader:(name:string,value:string|string[])=>{headers[name]=value;},status:(value:number)=>{status=value;return response;},json:(value:Record<string,unknown>)=>{body=value;return response;}};
  await handler({method:'POST',headers:{host:'localhost:3000',origin:'http://localhost:3000','content-type':'application/json'},cookies:{},query:{},...options} as NextApiRequest,response as unknown as NextApiResponse);
  return {status,body,headers};
};
const setup=async()=>{
  const created=await invoke(createHandler,{body:{track:'basics',day:1,locale:'en',durationSeconds:120}});
  const code=created.body.code as string;
  const hostToken=String(created.headers['Set-Cookie']).split(';')[0].split('=')[1];
  return {code,hostCookies:{[`ap-group-host-${code}`]:hostToken}};
};
beforeEach(()=>{injected.store=createMemoryRoomStore();});
describe('group-session API boundaries',()=>{
  it('creates a host-only room with a private no-store response and HttpOnly credentials',async()=>{
    const result=await invoke(createHandler,{body:{track:'basics',day:1,locale:'en',durationSeconds:120}});
    expect(result.status).toBe(201);expect(result.body.role).toBe('host');expect(result.body.queue).toEqual([]);
    expect(result.headers['Cache-Control']).toContain('no-store');expect(result.headers['Set-Cookie']).toContain('HttpOnly; SameSite=Lax');
    expect(JSON.stringify(result.body)).not.toContain('hostHash');
  });
  it('rejects unsupported verbs, cross-origin writes and malformed settings',async()=>{
    const unsupported=await invoke(createHandler,{method:'GET'});expect(unsupported.status).toBe(405);expect(unsupported.headers.Allow).toBe('POST');
    const foreign=await invoke(createHandler,{headers:{host:'localhost:3000',origin:'https://evil.example','content-type':'application/json'}});expect(foreign.status).toBe(403);
    expect((await invoke(createHandler,{body:{track:'basics'}})).status).toBe(400);
  });
  it('validates room codes and unknown actions',async()=>{
    expect((await invoke(roomHandler,{method:'GET',query:{code:'bad'}})).status).toBe(400);
    expect((await invoke(roomHandler,{query:{code:'ABC234'},body:{action:'reset'}})).status).toBe(400);
    expect((await invoke(roomHandler,{method:'GET',query:{code:'ABC234'}})).status).toBe(404);
  });
  it('joins, reconnects with the seat cookie, restricts starts and reveals results only at the end',async()=>{
    const {code,hostCookies}=await setup();const query={code};
    const visitor=await invoke(roomHandler,{method:'GET',query});expect(visitor.body.role).toBe('visitor');
    const joined=await invoke(roomHandler,{query,body:{action:'join',name:'Student'}});expect(joined.status).toBe(200);
    const token=String(joined.headers['Set-Cookie']).split(';')[0].split('=')[1];const cookies={[`ap-group-seat-${code}`]:token};
    expect((await invoke(roomHandler,{method:'GET',query,cookies})).body.role).toBe('player');
    expect((await invoke(roomHandler,{query,cookies,body:{action:'start'}})).status).toBe(403);
    expect((await invoke(roomHandler,{query,cookies:hostCookies,body:{action:'start'}})).body.phase).toBe('playing');
    const active=await invoke(roomHandler,{method:'GET',query,cookies});expect(active.body.queue).toHaveLength(10);expect(active.body.results).toEqual([]);
    const pr=(active.body.queue as {id:string}[])[0];
    const reviewed=await invoke(roomHandler,{query,cookies,body:{action:'review',prId:pr.id,verdict:'approve',selectedRefs:[]}});expect(reviewed.status).toBe(200);
    expect((reviewed.body.me as {reviewedIds:string[]}).reviewedIds).toEqual([pr.id]);expect(reviewed.body.reviews).toEqual([]);
    expect((await invoke(roomHandler,{query,cookies:hostCookies,body:{action:'finish'}})).body.phase).toBe('finished');
    const results=await invoke(roomHandler,{method:'GET',query,cookies});expect(results.body.results).toHaveLength(1);expect(results.body.reviews).toHaveLength(1);
    expect((await invoke(roomHandler,{method:'GET',query})).status).toBe(403);
  });
  it('makes production cookies secure and discards malformed cookie credentials',()=>{
    expect(credentialCookie('host','ABC234','token',true)).toContain('; Secure');
    expect(roomAuth({cookies:{'ap-group-seat-ABC234':'bad%0D%0A'}} as unknown as NextApiRequest,'ABC234').seat).toBeUndefined();
  });
});
