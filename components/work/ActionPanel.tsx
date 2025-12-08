import styles from '../../styles/Desk.module.css';
import { DecisionResult } from '../../context/GameContext';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';

interface ActionPanelProps {
  onApprove: () => void;
  onRequestChanges: () => void;
  disableApprove: boolean;
  canRequest: boolean;
  selectedLines: number;
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

  return (
    <div className={styles.actionBlock}>
      <div className={styles.actionIntro}>
        <div>
          <p className={styles.actionLabel}>{actionText.reviewLabel}</p>
          <p className={styles.selectionHint}>{actionText.selectedLines(selectedLines)}</p>
        </div>
        <TutorialHint text={actionText.tutorial} />
      </div>
      <div className={styles.actionButtons}>
        <div className={styles.actionButtonGroup}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.approveButton}`}
            onClick={onApprove}
            disabled={disableApprove}
          >
            <span>{actionText.approve}</span>
            <kbd className={styles.hotkeyBadge}>A</kbd>
          </button>
          <p className={styles.actionSubcopy}>{actionText.approveSubcopy}</p>
        </div>
        <div className={`${styles.actionButtonGroup} ${styles.requestGroup}`}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.requestButton}`}
            onClick={onRequestChanges}
            disabled={!canRequest}
            title={!canRequest ? actionText.requestTitle : undefined}
          >
            <span>{actionText.request}</span>
            <kbd className={styles.hotkeyBadge}>R</kbd>
          </button>
          <div className={styles.requestDetails}>
            {actionText.requestLabel ? <p className={styles.requestLabel}>{actionText.requestLabel}</p> : null}
            {actionText.requestHelper ? <p className={styles.requestHelper}>{actionText.requestHelper}</p> : null}
            <p className={styles.requestHelper}>{actionText.requestHelperBonus}</p>
          </div>
        </div>
      </div>
      <ul className={styles.shortcutLegend}>
        <li>
          <kbd className={styles.hotkeyBadge}>A</kbd>
          <span>{actionText.legendApprove}</span>
        </li>
        <li>
          <kbd className={styles.hotkeyBadge}>R</kbd>
          <span>{actionText.legendRequest}</span>
        </li>
      </ul>
      <p className={styles.hotkeyHint}>{actionText.hotkeyHint}</p>
      {feedback && <p className={`${styles.feedback} ${styles[`feedback-${feedback.status}`]}`}>{feedback.message}</p>}
    </div>
  );
};

export default ActionPanel;
