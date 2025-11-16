import styles from '../../styles/Desk.module.css';
import { BugKind } from '../../types';
import { DecisionResult } from '../../context/GameContext';
import TutorialHint from '../tutorial/TutorialHint';

interface ActionPanelProps {
  bugKind: BugKind;
  onBugKindChange: (kind: BugKind) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  disableApprove: boolean;
  canRequest: boolean;
  selectedLines: number;
  feedback: { message: string; status: DecisionResult['status'] } | null;
}

const bugKinds: BugKind[] = ['logic', 'security', 'performance', 'style'];

const ActionPanel = ({
  bugKind,
  onBugKindChange,
  onApprove,
  onRequestChanges,
  disableApprove,
  canRequest,
  selectedLines,
  feedback
}: ActionPanelProps) => {
  return (
    <div className={styles.actionBlock}>
      <div className={styles.actionIntro}>
        <div>
          <p className={styles.actionLabel}>Review Actions</p>
          <p className={styles.selectionHint}>Selected lines: {selectedLines}</p>
        </div>
        <TutorialHint text="Wrap up reviews here. Use keyboard shortcuts to move faster once you're confident." />
      </div>
      <div className={styles.bugKindRow}>
        <small>Suspected Bug Type</small>
        <div className={styles.bugKindButtons}>
          {bugKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className={[styles.bugKindButton, kind === bugKind ? styles.bugKindButtonActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onBugKindChange(kind)}
            >
              {kind}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.actionButtons}>
        <button type="button" onClick={onApprove} disabled={disableApprove}>
          <span>Approve & Deploy</span>
          <kbd className={styles.hotkeyBadge}>A</kbd>
        </button>
        <button type="button" onClick={onRequestChanges} disabled={!canRequest}>
          <span>Request Changes</span>
          <kbd className={styles.hotkeyBadge}>R</kbd>
        </button>
      </div>
      <ul className={styles.shortcutLegend}>
        <li>
          <kbd className={styles.hotkeyBadge}>A</kbd>
          <span>Approve immediately when the diff looks clean.</span>
        </li>
        <li>
          <kbd className={styles.hotkeyBadge}>R</kbd>
          <span>Request changes after highlighting the problematic lines.</span>
        </li>
      </ul>
      <p className={styles.hotkeyHint}>Need justification? Highlight lines in the diff, choose a bug type, then press R.</p>
      {feedback && <p className={`${styles.feedback} ${styles[`feedback-${feedback.status}`]}`}>{feedback.message}</p>}
    </div>
  );
};

export default ActionPanel;
