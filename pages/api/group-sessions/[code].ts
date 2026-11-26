import type { NextApiRequest, NextApiResponse } from 'next';
import type { GroupCommand } from '../../../types/groupSessions';
import { applyCommand, GroupError, newCredential, snapshotRoom } from '../../../server/groupSessions';
import { getRoomStore, transactRoom } from '../../../server/groupSessionStore';
import { checkRequest, credentialCookie, respondError, roomAuth } from '../../../server/groupSessionHttp';

export const config = { api: { bodyParser: { sizeLimit:'32kb' } } };
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
  try {
    checkRequest(req,res,['GET','POST']);
    const code=typeof req.query.code==='string' ? req.query.code.toUpperCase() : '';
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) throw new GroupError(400,'invalid_code');
    const command=req.body as GroupCommand | undefined;
    if (req.method==='POST' && (!command || !['join','start','finish','review'].includes(command.action))) throw new GroupError(400,'invalid_action');
    const auth=roomAuth(req,code);
    const joining=req.method==='POST' && command?.action==='join';
    if (joining && !auth.seat) auth.seat=newCredential();
    const snapshot=await transactRoom(getRoomStore(),code,room=>{
      const now=Date.now();
      if (req.method==='POST') applyCommand(room,command!,auth,now);
      return snapshotRoom(room,auth,now);
    });
    if (joining) res.setHeader('Set-Cookie',credentialCookie('seat',code,auth.seat!,process.env.NODE_ENV==='production'));
    return res.status(200).json(snapshot);
  } catch(error) { return respondError(error,res); }
}
