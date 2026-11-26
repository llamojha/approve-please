import { getSupabaseServiceClient } from '../utils/supabaseClient';
import { GroupError, type GroupRoom } from './groupSessions';

interface Row { code: string; version: number; state: GroupRoom }
interface RoomStore {
  insert(room: GroupRoom): Promise<boolean>;
  read(code: string): Promise<Row | null>;
  replace(code: string, version: number, state: GroupRoom): Promise<boolean>;
}
/** Explicit local preview only; never silently fall back when the database fails. */
export const createMemoryRoomStore = (): RoomStore => {
  const rooms = new Map<string,Row>();
  return {
    async insert(state) { if (rooms.has(state.code)) return false; rooms.set(state.code,{code:state.code,version:0,state:structuredClone(state)}); return true; },
    async read(code) { const row=rooms.get(code); return row ? structuredClone(row) : null; },
    async replace(code,version,state) { const row=rooms.get(code); if (!row || row.version!==version) return false; rooms.set(code,{code,version:version+1,state:structuredClone(state)}); return true; }
  };
};
const localGlobal = globalThis as typeof globalThis & { approvePleaseGroupStore?: RoomStore };
export const getRoomStore = (): RoomStore => {
  if (process.env.GROUP_SESSION_STORE === 'memory' && process.env.NODE_ENV !== 'production') {
    return localGlobal.approvePleaseGroupStore ??= createMemoryRoomStore();
  }
  if (process.env.GROUP_SESSIONS_ENABLED !== 'true') throw new GroupError(503,'sessions_unavailable');
  const db=getSupabaseServiceClient();
  if (!db) throw new GroupError(503,'sessions_unavailable');
  return {
    async insert(state) {
      const {error}=await db.from('group_sessions').insert({code:state.code,version:0,state,expires_at:new Date(state.expiresAt).toISOString()});
      if (error?.code==='23505') return false;
      if (error) throw new GroupError(503,'sessions_unavailable');
      return true;
    },
    async read(code) {
      const {data,error}=await db.from('group_sessions').select('code,version,state').eq('code',code).maybeSingle();
      if (error) throw new GroupError(503,'sessions_unavailable');
      return data as Row | null;
    },
    async replace(code,version,state) {
      const {data,error}=await db.from('group_sessions').update({state,version:version+1}).eq('code',code).eq('version',version).select('code');
      if (error) throw new GroupError(503,'sessions_unavailable');
      return Boolean(data?.length);
    }
  };
};
/** Compare-and-swap retries prevent simultaneous players from overwriting each other. */
export const transactRoom = async <T,>(store: RoomStore, code: string, change: (room: GroupRoom) => T): Promise<T> => {
  for (let attempt=0;attempt<12;attempt++) {
    const row=await store.read(code);
    if (!row) throw new GroupError(404,'room_not_found');
    const before=JSON.stringify(row.state);
    const result=change(row.state);
    if (JSON.stringify(row.state)===before || await store.replace(code,row.version,row.state)) return result;
    // Let contending requests settle before rereading the document.
    await new Promise(resolve=>setTimeout(resolve,5+attempt*5));
  }
  throw new GroupError(409,'room_busy');
};
