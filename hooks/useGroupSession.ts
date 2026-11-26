import { useCallback, useEffect, useRef, useState } from 'react';
import type { GroupCommand, GroupSnapshot } from '../types/groupSessions';

export const roomRequest = async (url:string, command?:unknown):Promise<GroupSnapshot> => {
  const response=await fetch(url,{method:command ? 'POST':'GET',credentials:'same-origin',cache:'no-store',
    ...(command ? {headers:{'Content-Type':'application/json'},body:JSON.stringify(command)} : {})});
  const data=await response.json();
  if (!response.ok) throw new Error(data.error ?? 'session_error');
  return data;
};
export const useGroupSession = (code:string) => {
  const [room,setRoom]=useState<GroupSnapshot|null>(null);
  const [error,setError]=useState('');
  const [connectionError,setConnectionError]=useState(false);
  const [connectionCode,setConnectionCode]=useState('');
  const [busy,setBusy]=useState(false);
  const activeCode=useRef(code);
  const locked=useRef(false);
  const epoch=useRef(0);
  useEffect(()=>{activeCode.current=code;setRoom(null);setError('');setConnectionError(false);setConnectionCode('');},[code]);
  const accept=useCallback((snapshot:GroupSnapshot)=>{
    if (snapshot.code!==activeCode.current) return;
    setRoom(previous=>!previous || snapshot.serverNow>=previous.serverNow ? snapshot:previous);
    setConnectionError(false);
    setConnectionCode('');
  },[]);
  const refresh=useCallback(async()=>{
    if (!code || locked.current) return;
    const startedEpoch=epoch.current;
    try { const snapshot=await roomRequest(`/api/group-sessions/${code}`);if(startedEpoch===epoch.current) accept(snapshot); }
    catch(cause) { if(activeCode.current===code && startedEpoch===epoch.current) {setConnectionError(true);setConnectionCode(cause instanceof Error ? cause.message:'session_error');} }
  },[code,accept]);
  useEffect(()=>{
    if (room?.phase==='finished') return;
    void refresh();
    const timer=window.setInterval(()=>{if (!document.hidden) void refresh();},2000);
    const wake=()=>{if (!document.hidden) void refresh();};
    document.addEventListener('visibilitychange',wake);
    return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',wake);};
  },[refresh,room?.phase]);
  const command=useCallback(async(value:GroupCommand)=>{
    if (locked.current) return false;
    locked.current=true;epoch.current++;setBusy(true);setError('');
    try { accept(await roomRequest(`/api/group-sessions/${code}`,value));return true; }
    catch(cause) { setError(cause instanceof Error ? cause.message:'session_error');return false; }
    finally { locked.current=false;epoch.current++;setBusy(false);void refresh(); }
  },[code,accept,refresh]);
  return {room,error:error||connectionCode,connectionError,busy,command,refresh};
};
