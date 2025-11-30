import { ReactNode, useEffect, useRef, useState } from 'react';
import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';

interface QueuePanelProps {
  queue: PullRequest[];
  currentId: string | null;
  onSelect: (id: string) => void;
  tutorialGuide?: ReactNode;
}

interface RenderQueueEntry {
  pr: PullRequest;
  isDeparting: boolean;
}

const EXIT_ANIMATION_MS = 600;

const importanceHue: Record<PullRequest['importance'], string> = {
  low: '#6ee7b7',
  normal: '#fcd34d',
  high: '#f87171'
};

const QueuePanel = ({ queue, currentId, onSelect, tutorialGuide }: QueuePanelProps) => {
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

  return (
    <Panel
      title={queueText.title}
      titleHint={<TutorialHint text={queueText.hint} />}
    >
      {tutorialGuide && <div className={styles.tutorialGuideSlot}>{tutorialGuide}</div>}
      <ul className={styles.queueList}>
        {renderQueue.length === 0 && <li className={styles.queueEmpty}>{queueText.empty}</li>}
        {renderQueue.map(({ pr, isDeparting }) => {
          const isArriving = Boolean(arrivingIds[pr.id]);
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
              <button
                type="button"
                className={className}
                onClick={() => onSelect(pr.id)}
                disabled={isDeparting}
              >
                <div>
                  <strong>{pr.title}</strong>
                  <p>{pr.author}</p>
                </div>
                <span
                  className={styles.importanceTag}
                  style={{ background: importanceHue[pr.importance] }}
                >
                  {importanceLabels[pr.importance] ?? pr.importance}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default QueuePanel;
