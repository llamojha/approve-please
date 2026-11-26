import type { NextApiRequest, NextApiResponse } from 'next';
import { GroupError } from './groupSessions';

export const checkRequest = (req: NextApiRequest, res: NextApiResponse, methods: string[]) => {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('Vary','Cookie');
  if (!methods.includes(req.method ?? '')) { res.setHeader('Allow',methods.join(', ')); throw new GroupError(405,'method_not_allowed'); }
  if (req.method==='POST') {
    // A room code is not an authorization token. Require same-origin JSON writes.
    const origin=req.headers.origin;
    let originHost: string;
    try { originHost=new URL(origin ?? '').host; } catch { throw new GroupError(403,'invalid_origin'); }
    if (originHost!==req.headers.host || !req.headers['content-type']?.startsWith('application/json')) throw new GroupError(403,'invalid_origin');
  }
};
export const credentialCookie = (kind:'host'|'seat', code:string, token:string, secure:boolean) =>
  `ap-group-${kind}-${code}=${token}; Path=/api/group-sessions; HttpOnly; SameSite=Lax; Max-Age=86400${secure?'; Secure':''}`;
export const roomAuth = (req:NextApiRequest,code:string) => {
  const read=(kind:string)=>{const value=req.cookies[`ap-group-${kind}-${code}`];return value && /^[A-Za-z0-9_-]{43}$/.test(value)?value:undefined;};
  return {host:read('host'),seat:read('seat')};
};
export const respondError = (error:unknown,res:NextApiResponse) => {
  if (error instanceof GroupError) return res.status(error.status).json({error:error.code});
  // Do not log the room document, player credentials or request body.
  console.error('[group-sessions] Unexpected operation failure');
  return res.status(500).json({error:'session_error'});
};
