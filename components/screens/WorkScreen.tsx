import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../styles/Desk.module.css';
import { useGameState, DecisionResult } from '../../context/GameContext';
import { useGameClock } from '../../hooks/useGameClock';
import { usePRSpawner } from '../../hooks/usePRSpawner';
import { BugKind } from '../../types';
import { useAudioCue } from '../../hooks/useAudioCue';
import ClockDisplay from '../work/ClockDisplay';
import QueuePanel from '../work/QueuePanel';
import PRViewer from '../work/PRViewer';
import RulebookPanel from '../work/RulebookPanel';
import StatsPanel from '../work/StatsPanel';
import ActionPanel from '../work/ActionPanel';
import AccessibilityPanel from '../work/AccessibilityPanel';

const WorkScreen = () => {
  const {
    state: { queue, currentPR, currentTime, counters, meters, rules, activeConfig, currentDay, dayQuote },
    actions: { selectPR, approveCurrentPR, requestChanges }
  } = useGameState();
  useGameClock();
  usePRSpawner();
  const { playCue, playArrivalCue } = useAudioCue();

  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [bugKind, setBugKind] = useState<BugKind>('logic');
  const [feedback, setFeedback] = useState<{ message: string; status: DecisionResult['status'] } | null>(null);
  const previousQueueLength = useRef(queue.length);

  useEffect(() => {
    setSelectedLines([]);
    setFeedback(null);
  }, [currentPR?.id]);

  useEffect(() => {
    if (queue.length > previousQueueLength.current) {
      playArrivalCue();
    }
    previousQueueLength.current = queue.length;
  }, [queue.length, playArrivalCue]);

  const toggleLine = (lineNumber: number) => {
    setSelectedLines((prev) =>
      prev.includes(lineNumber) ? prev.filter((line) => line !== lineNumber) : [...prev, lineNumber]
    );
  };

  const handleApprove = useCallback(() => {
    const result = approveCurrentPR();
    setFeedback({ message: result.message, status: result.status });
    if (result.success) {
      setSelectedLines([]);
      playCue(520, 0.1);
    }
  }, [approveCurrentPR, playCue]);

  const handleRequestChanges = useCallback(() => {
    const result = requestChanges({ selectedLines, bugKind });
    setFeedback({ message: result.message, status: result.status });
    if (result.success) {
      setSelectedLines([]);
      playCue(360, 0.15);
    }
  }, [requestChanges, selectedLines, bugKind, playCue]);

  const canRequest = Boolean(currentPR) && selectedLines.length > 0;
  const canApprove = Boolean(currentPR);

  const queuedCount = queue.length;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }
      if ((event.key === 'a' || event.key === 'A') && canApprove) {
        event.preventDefault();
        handleApprove();
      }
      if ((event.key === 'r' || event.key === 'R') && canRequest) {
        event.preventDefault();
        handleRequestChanges();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleApprove, handleRequestChanges, canApprove, canRequest]);

  return (
    <main className={styles.deskShell}>
      <div className={styles.desk}>
        <div className={styles.leftColumn}>
          <ClockDisplay currentTime={currentTime} />
          <QueuePanel queue={queue} currentId={currentPR?.id ?? null} onSelect={selectPR} />
          <p className={styles.queueHint}>{queuedCount} awaiting review</p>
        </div>
        <div className={styles.centerColumn}>
          <PRViewer
            pr={currentPR}
            selectedLines={selectedLines}
            onToggleLine={toggleLine}
            actionSlot={
              <ActionPanel
                bugKind={bugKind}
                onBugKindChange={setBugKind}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
                disableApprove={!canApprove}
                canRequest={canRequest}
                selectedLines={selectedLines.length}
                feedback={feedback}
              />
            }
          />
        </div>
        <div className={styles.rightColumn}>
          <RulebookPanel
            rules={rules}
            day={currentDay}
            codename={activeConfig.codename}
            mood={activeConfig.mood}
            dayQuote={dayQuote}
          />
          <StatsPanel counters={counters} meters={meters} />
          <AccessibilityPanel />
        </div>
      </div>
    </main>
  );
};

export default WorkScreen;
