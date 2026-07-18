import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../../styles/Desk.module.css';
import { useGameState, DecisionResult } from '../../context/GameContext';
import { useGameClock } from '../../hooks/useGameClock';
import { usePRSpawner } from '../../hooks/usePRSpawner';
import { useAudioCue } from '../../hooks/useAudioCue';
import QueuePanel from '../work/QueuePanel';
import PRViewer from '../work/PRViewer';
import RulebookPanel from '../work/RulebookPanel';
import StatsPanel from '../work/StatsPanel';
import ActionPanel from '../work/ActionPanel';
import AccessibilityPanel from '../work/AccessibilityPanel';
import StatusStrip from '../work/StatusStrip';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';

const WorkScreen = () => {
  const {
    state: { queue, currentPR, currentTime, counters, meters, currentMantra, currentDay, dayQuote },
    actions: { selectPR, approveCurrentPR, requestChanges }
  } = useGameState();
  const translations = useTranslations();
  const { locale } = useLocale();
  useGameClock();
  usePRSpawner();
  const { playCue, playArrivalCue } = useAudioCue();

  const [selectedLines, setSelectedLines] = useState<number[]>([]);
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
    const result = requestChanges({ selectedLines });
    setFeedback({ message: result.message, status: result.status });
    if (result.success) {
      setSelectedLines([]);
      playCue(360, 0.15);
    }
  }, [requestChanges, selectedLines, playCue]);

  const canRequest = Boolean(currentPR);
  const canApprove = Boolean(currentPR);

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

  const mantra = currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback;

  return (
    <main className={styles.deskShell}>
      <div className={styles.deskFrame}>
        <StatusStrip day={currentDay} currentTime={currentTime} meters={meters} />
        <div className={styles.deskGrid}>
          <aside className={styles.inboxCol}>
            <QueuePanel queue={queue} currentId={currentPR?.id ?? null} onSelect={selectPR} />
          </aside>
          <section className={styles.stageCol}>
            <PRViewer
              pr={currentPR}
              selectedLines={selectedLines}
              onToggleLine={toggleLine}
              actionSlot={
                <ActionPanel
                  onApprove={handleApprove}
                  onRequestChanges={handleRequestChanges}
                  disableApprove={!canApprove}
                  canRequest={canRequest}
                  selectedLines={selectedLines}
                  feedback={feedback}
                />
              }
            />
          </section>
          <aside className={styles.opsCol}>
            <RulebookPanel day={currentDay} mantra={mantra} dayQuote={dayQuote} />
            <StatsPanel counters={counters} />
            <AccessibilityPanel />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default WorkScreen;
