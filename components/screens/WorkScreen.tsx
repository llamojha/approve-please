import { useCallback, useEffect, useMemo, useRef, useState, RefObject } from 'react';
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
import MeterHud from '../work/MeterHud';
import { useTranslations } from '../../hooks/useTranslations';
import { useLocale } from '../../context/LocaleContext';
import TutorialOverlay from '../tutorial/TutorialOverlay';

const WorkScreen = () => {
  const {
    state: { queue, currentPR, currentTime, counters, meters, currentMantra, currentDay, dayQuote, phase },
    actions: { selectPR, approveCurrentPR, requestChanges },
    mode
  } = useGameState();
  const translations = useTranslations();
  const { locale } = useLocale();
  useGameClock();
  usePRSpawner();
  const { playCue, playArrivalCue } = useAudioCue();
  const isTutorial = mode === 'tutorial';
  const queuePanelRef = useRef<HTMLDivElement | null>(null);
  const prViewerRef = useRef<HTMLDivElement | null>(null);
  const actionPanelRef = useRef<HTMLDivElement | null>(null);
  const centerColumnRef = useRef<HTMLDivElement | null>(null);
  const [queueIntroComplete, setQueueIntroComplete] = useState(false);
  const [bugPRActive, setBugPRActive] = useState(false);

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
  const tutorialCopy = translations.tutorial;
  const tutorialOverlayCopy = tutorialCopy.overlay;
  const CLEAN_TUTORIAL_ID = 'pr-000-onboarding-readme-update';
  const BUG_TUTORIAL_ID = 'pr-001-sanitize-readme-api-key';

  const handleQueueSelect = useCallback(
    (id: string) => {
      if (isTutorial && !queueIntroComplete) {
        const match = queue.find((item) => item.id === id);
        if (match?.templateId === CLEAN_TUTORIAL_ID) {
          setQueueIntroComplete(true);
        }
      }
      selectPR(id);
    },
    [isTutorial, queueIntroComplete, queue, selectPR]
  );

  useEffect(() => {
    if (!isTutorial) {
      return;
    }
    if (currentPR?.templateId === BUG_TUTORIAL_ID) {
      setBugPRActive(true);
    }
  }, [isTutorial, currentPR?.templateId]);

  const overlayStep = useMemo(() => {
    if (!isTutorial || phase !== 'WORK') {
      return null;
    }
    if (!queueIntroComplete) {
      return 'queue';
    }
    if (counters.prsApproved === 0) {
      return 'clean';
    }
    if (counters.prsRejected > 0) {
      return 'complete';
    }
    if (bugPRActive) {
      if (selectedLines.length === 0) {
        return 'bug';
      }
      return 'request';
    }
    return null;
  }, [isTutorial, phase, queueIntroComplete, counters.prsApproved, counters.prsRejected, bugPRActive, selectedLines.length]);

  const overlayTargets: Record<'queue' | 'clean' | 'bug' | 'request' | 'complete', RefObject<HTMLDivElement | null>> = {
    queue: queuePanelRef,
    clean: prViewerRef,
    bug: prViewerRef,
    request: actionPanelRef,
    complete: centerColumnRef
  };

  const overlayContent = overlayStep ? tutorialOverlayCopy[overlayStep] : null;
  const overlayTarget = overlayStep ? overlayTargets[overlayStep] : null;

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
      {isTutorial && <div className={styles.tutorialModePill}>{tutorialCopy.badge}</div>}
      {overlayStep && overlayContent && overlayTarget && (
        <TutorialOverlay
          badge={tutorialCopy.badge}
          title={overlayContent.title}
          body={overlayContent.body}
          targetRef={overlayTarget}
        />
      )}
      <div className={styles.desk}>
        <div className={styles.leftColumn}>
          <ClockDisplay currentTime={currentTime} isTutorial={isTutorial} />
          <div ref={queuePanelRef}>
            <QueuePanel
              queue={queue}
              currentId={currentPR?.id ?? null}
              onSelect={handleQueueSelect}
            />
          </div>
          <p className={styles.queueHint}>{translations.shared.queueAwaiting(queuedCount)}</p>
        </div>
        <div className={styles.centerColumn} ref={centerColumnRef}>
          <MeterHud meters={meters} queue={queue} />
          <div ref={prViewerRef}>
            <PRViewer
              pr={currentPR}
              selectedLines={selectedLines}
              onToggleLine={toggleLine}
              actionSlot={
                <div ref={actionPanelRef}>
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
                </div>
              }
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <RulebookPanel
            day={currentDay}
            mantra={currentMantra?.[locale] ?? currentMantra?.en ?? translations.shared.operationsFallback}
            dayQuote={dayQuote}
          />
          <StatsPanel counters={counters} />
          <AccessibilityPanel />
        </div>
      </div>
    </main>
  );
};

export default WorkScreen;
