import type { NextApiRequest, NextApiResponse } from 'next';
import { createRoom, GroupError, newCredential, parseSettings, snapshotRoom } from '../../../server/groupSessions';
import { getRoomStore } from '../../../server/groupSessionStore';
import { checkRequest, credentialCookie, respondError } from '../../../server/groupSessionHttp';

export const config = { api: { bodyParser: { sizeLimit:'8kb' } } };
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
  try {
    checkRequest(req,res,['POST']);
    const settings=parseSettings(req.body);
    const store=getRoomStore();
    const token=newCredential();
    for (let attempt=0;attempt<5;attempt++) {
      const room=await createRoom(settings,token,Date.now());
      if (!await store.insert(room)) continue;
      res.setHeader('Set-Cookie',credentialCookie('host',room.code,token,process.env.NODE_ENV==='production'));
      return res.status(201).json(snapshotRoom(room,{host:token},Date.now()));
    }
    throw new GroupError(503,'room_busy');
  } catch(error) { return respondError(error,res); }
}
