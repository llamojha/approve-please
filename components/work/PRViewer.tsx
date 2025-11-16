import { ReactNode } from 'react';
import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';

interface PRViewerProps {
  pr: PullRequest | null;
  selectedLines: number[];
  onToggleLine: (lineNumber: number) => void;
  actionSlot?: ReactNode;
}

const PRViewer = ({ pr, selectedLines, onToggleLine, actionSlot }: PRViewerProps) => {
  if (!pr) {
    return (
      <Panel
        title="PR Details"
        titleHint={<TutorialHint text="Select a PR from the queue to inspect its summary and diff here." />}
      >
        <div className={styles.prPlaceholder}>
          <p>Load a PR from the queue to begin review.</p>
        </div>
      </Panel>
    );
  }

  const selected = new Set(selectedLines);

  return (
    <Panel
      title="PR Details"
      titleHint={<TutorialHint text="Click any line number to flag suspected bugs before requesting changes." />}
    >
      <article className={styles.prMeta}>
        <header>
          <h2>{pr.title}</h2>
          <p>Author: {pr.author}</p>
        </header>
        <p className={styles.prDescription}>{pr.description}</p>
        <div className={styles.tagList}>
          {pr.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </article>
      <div className={styles.diffHintBanner}>
        <p>
          Tip: click the line number to highlight a suspicious row. Selected lines glow and count toward your Request
          Changes justification.
        </p>
      </div>
      <div className={styles.diffWrapper}>
        {pr.files.map((file) => (
          <section key={file.filename} className={styles.diffSection}>
            <header className={styles.diffHeader}>
              <p>
                <strong>{file.filename}</strong>
                <span>{file.language}</span>
              </p>
            </header>
            <div className={styles.diffLines}>
              {file.lines.map((line) => (
                <button
                  type="button"
                  key={`${file.filename}-${line.lineNumber}`}
                  className={[styles.diffLine, selected.has(line.lineNumber) ? styles.diffLineSelected : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onToggleLine(line.lineNumber)}
                >
                  <span className={styles.lineNumber}>{line.lineNumber}</span>
                  <span className={line.isNew ? styles.lineContentNew : styles.lineContentOld}>{line.content}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {actionSlot && <div className={styles.prActions}>{actionSlot}</div>}
    </Panel>
  );
};

export default PRViewer;
