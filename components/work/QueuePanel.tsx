import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';

interface QueuePanelProps {
  queue: PullRequest[];
  currentId: string | null;
  onSelect: (id: string) => void;
}

const importanceHue: Record<PullRequest['importance'], string> = {
  low: '#6ee7b7',
  normal: '#fcd34d',
  high: '#f87171'
};

const QueuePanel = ({ queue, currentId, onSelect }: QueuePanelProps) => {
  return (
    <Panel
      title="PR Queue"
      titleHint={<TutorialHint text="Pick a PR to load it into the diff view. New submissions show up automatically." />}
    >
      <ul className={styles.queueList}>
        {queue.length === 0 && <li className={styles.queueEmpty}>No incoming PRs. Await the next wave.</li>}
        {queue.map((pr) => (
          <li key={pr.id}>
            <button
              type="button"
              className={[styles.queueItem, pr.id === currentId ? styles.queueItemActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(pr.id)}
            >
              <div>
                <strong>{pr.title}</strong>
                <p>{pr.author}</p>
              </div>
              <span
                className={styles.importanceTag}
                style={{ background: importanceHue[pr.importance] }}
              >
                {pr.importance}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default QueuePanel;
