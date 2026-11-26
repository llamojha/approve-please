import { useEffect, useState } from 'react';
import type { GroupSnapshot } from '../../types/groupSessions';

export const useGroupCountdown = (room:GroupSnapshot) => {
  const [remaining,setRemaining]=useState(Math.max(0,(room.endsAt ?? room.serverNow)-room.serverNow));
  useEffect(()=>{
    const started=performance.now();
    const tick=()=>setRemaining(Math.max(0,(room.endsAt ?? room.serverNow)-room.serverNow-(performance.now()-started)));
    tick();const timer=window.setInterval(tick,250);return ()=>window.clearInterval(timer);
  },[room.serverNow,room.endsAt]);
  return remaining;
};
export function GroupClock({room,label}:{room:GroupSnapshot;label:string}) {
  const remaining=useGroupCountdown(room);
  const seconds=Math.ceil(remaining/1000);
  return <span aria-label={label}>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</span>;
}
