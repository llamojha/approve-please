import styles from '../../styles/Desk.module.css';
import { DecisionResult } from '../../context/GameContext';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';

interface ActionPanelProps {
  onApprove: () => void;
  onRequestChanges: () => void;
  disableApprove: boolean;
  canRequest: boolean;
  selectedLines: number[];
  feedback: { message: string; status: DecisionResult['status'] } | null;
}

const ActionPanel = ({
  onApprove,
  onRequestChanges,
  disableApprove,
  canRequest,
  selectedLines,
  feedback
}: ActionPanelProps) => {
  const translations = useTranslations();
  const actionText = translations.work.actions;
  const tagged = selectedLines.length;
  const tagList = [...selectedLines].sort((a, b) => a - b).map((line) => `L${line}`).join(' · ');

  return (
    <div className={styles.actionBar}>
      {tagged > 0 ? (
        <span className={styles.actionTagStatus}>
          {actionText.selectedLines(tagged).toUpperCase()} <span className={styles.actionTagLines}>· {tagList}</span>
          <TutorialHint text={actionText.tutorial} />
        </span>
      ) : (
        <span className={`${styles.actionTagStatus} ${styles.actionTagStatusEmpty}`}>
          CLICK A LINE № TO TAG IT
          <TutorialHint text={actionText.tutorial} />
        </span>
      )}
      <div className={styles.actionButtons}>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.requestButton}`}
          onClick={onRequestChanges}
          disabled={!canRequest}
          title={!canRequest ? actionText.requestTitle : undefined}
        >
          <span>{actionText.request.toUpperCase()}</span>
          <kbd className={styles.hotkeyBadge}>R</kbd>
        </button>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.approveButton}`}
          onClick={onApprove}
          disabled={disableApprove}
        >
          <span>{actionText.approve.toUpperCase()}</span>
          <kbd className={styles.hotkeyBadge}>A</kbd>
        </button>
      </div>
      {feedback && <p className={`${styles.feedback} ${styles[`feedback-${feedback.status}`]}`}>{feedback.message}</p>}
    </div>
  );
};

export default ActionPanel;
