import { useEffect, useRef, useState } from 'react';

export interface ArrivalNotice { count: number; serial: number }

export function incomingPullRequests(previous: readonly string[], next: readonly string[]): string[] {
  const known = new Set(previous);
  return [...new Set(next)].filter(id => !known.has(id));
}

/** Identity detects arrivals even when another PR leaves in the same update. */
export function usePRArrivalNotice(ids: readonly string[], playArrivalCue: () => void) {
  const previous = useRef(ids);
  const serial = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notice, setNotice] = useState<ArrivalNotice | null>(null);
  useEffect(() => {
    const incoming = incomingPullRequests(previous.current, ids);
    previous.current = ids;
    if (!incoming.length) return;
    playArrivalCue();
    setNotice({ count: incoming.length, serial: ++serial.current });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 3000);
  }, [ids, playArrivalCue]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return notice;
}
