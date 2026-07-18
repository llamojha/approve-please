import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';
import { WORK_DAY_MINUTES } from '../../constants/game';
import { minutesToClock, shortPrNumber, summarizeDiff } from '../../utils/helpers';

interface QueuePanelProps {
  queue: PullRequest[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

interface RenderQueueEntry {
  pr: PullRequest;
  isDeparting: boolean;
}

const EXIT_ANIMATION_MS = 600;

const importanceClass: Record<PullRequest['importance'], string> = {
  low: styles.importanceLow,
  normal: styles.importanceNormal,
  high: styles.importanceHigh
};

const QueuePanel = ({ queue, currentId, onSelect }: QueuePanelProps) => {
  const translations = useTranslations();
  const queueText = translations.work.queue;
  const importanceLabels = translations.shared.importance;
  const [arrivingIds, setArrivingIds] = useState<Record<string, true>>({});
  const [renderQueue, setRenderQueue] = useState<RenderQueueEntry[]>(() =>
    queue.map((pr) => ({ pr, isDeparting: false }))
  );
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const exitTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const previousIds = useRef<string[]>([]);

  useEffect(() => {
    const prev = previousIds.current;
    const prevSet = new Set(prev);
    const nextIds = queue.map((pr) => pr.id);
    const newEntries = nextIds.filter((id) => !prevSet.has(id));

    if (newEntries.length > 0) {
      setArrivingIds((current) => {
        const next = { ...current };
        newEntries.forEach((id) => {
          next[id] = true;
          if (timeoutsRef.current[id]) {
            clearTimeout(timeoutsRef.current[id]);
          }
          const timeout = setTimeout(() => {
            setArrivingIds((map) => {
              const nextMap = { ...map };
              delete nextMap[id];
              return nextMap;
            });
            delete timeoutsRef.current[id];
          }, 900);
          timeoutsRef.current[id] = timeout;
        });
        return next;
      });
    }

    previousIds.current = nextIds;
  }, [queue]);

  useEffect(() => {
    setRenderQueue((current) => {
      const currentMap = new Map<string, { entry: RenderQueueEntry; index: number }>();
      current.forEach((entry, index) => {
        currentMap.set(entry.pr.id, { entry, index });
      });

      const nextEntries = queue.map((pr) => {
        const match = currentMap.get(pr.id);
        if (exitTimeoutsRef.current[pr.id]) {
          clearTimeout(exitTimeoutsRef.current[pr.id]);
          delete exitTimeoutsRef.current[pr.id];
        }
        if (match) {
          currentMap.delete(pr.id);
          return { ...match.entry, pr, isDeparting: false };
        }
        return { pr, isDeparting: false };
      });

      currentMap.forEach(({ entry, index }) => {
        const alreadyDeparting = entry.isDeparting;
        const departingEntry = alreadyDeparting ? entry : { ...entry, isDeparting: true };
        if (!alreadyDeparting) {
          const timeout = setTimeout(() => {
            setRenderQueue((items) => items.filter((item) => item.pr.id !== entry.pr.id));
            delete exitTimeoutsRef.current[entry.pr.id];
          }, EXIT_ANIMATION_MS);
          exitTimeoutsRef.current[entry.pr.id] = timeout;
        }
        const insertIndex = Math.min(index, nextEntries.length);
        nextEntries.splice(insertIndex, 0, departingEntry);
      });

      return nextEntries;
    });
  }, [queue]);

  useEffect(
    () => () => {
      Object.values(timeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      Object.values(exitTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
    },
    []
  );

  const awaitingCount = queue.length;

  return (
    <>
      <div className={styles.inboxHeader}>
        <span className={styles.inboxHeaderLabel}>
          — {queueText.title.toUpperCase()} · {awaitingCount.toString().padStart(3, '0')}
        </span>
        <span className={styles.inboxHeaderEnds}>
          <TutorialHint text={queueText.hint} /> {minutesToClock(WORK_DAY_MINUTES)}
        </span>
      </div>
      <ul className={styles.queueList}>
        {renderQueue.length === 0 && <li className={styles.queueEmpty}>{queueText.empty}</li>}
        {renderQueue.map(({ pr, isDeparting }) => {
          const isArriving = Boolean(arrivingIds[pr.id]);
          const summary = summarizeDiff(pr);
          const className = [
            styles.queueItem,
            pr.id === currentId ? styles.queueItemActive : '',
            isArriving ? styles.queueItemArrival : '',
            isDeparting ? styles.queueItemExit : ''
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={pr.id}>
              <button type="button" className={className} onClick={() => onSelect(pr.id)} disabled={isDeparting}>
                <div className={styles.queueTopRow}>
                  <span className={styles.queueMeta}>
                    {shortPrNumber(pr.id)} · {pr.author}
                  </span>
                  <span className={`${styles.importanceTag} ${importanceClass[pr.importance]}`}>
                    {(importanceLabels[pr.importance] ?? pr.importance).toUpperCase()}
                  </span>
                </div>
                <div className={styles.queueTitle}>{pr.title}</div>
                <div className={styles.queueSummary}>
                  {summary.fileCount} file{summary.fileCount === 1 ? '' : 's'} · +{summary.additions} −
                  {summary.removals}
                  {summary.language ? ` · ${summary.language}` : ''}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.inboxFooter}>{translations.shared.queueAwaiting(awaitingCount).toUpperCase()}</div>
    </>
  );
};

export default QueuePanel;
