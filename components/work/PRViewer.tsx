import { ReactNode } from 'react';
import Panel from '../common/Panel';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';

interface PRViewerProps {
  pr: PullRequest | null;
  selectedLines: number[];
  onToggleLine: (lineNumber: number) => void;
  actionSlot?: ReactNode;
}

const PRViewer = ({ pr, selectedLines, onToggleLine, actionSlot }: PRViewerProps) => {
  const translations = useTranslations();
  const viewerText = translations.work.prViewer;
  const requestLabel = translations.work.actions.request;

  if (!pr) {
    return (
      <Panel
        title={viewerText.title}
        titleHint={<TutorialHint text={viewerText.hintSelect} />}
      >
        <div className={styles.prPlaceholder}>
          <p>{viewerText.placeholder}</p>
        </div>
      </Panel>
    );
  }

  const selected = new Set(selectedLines);

  return (
    <Panel
      title={viewerText.title}
      titleHint={<TutorialHint text={viewerText.hintLines} />}
    >
      <article className={styles.prMeta}>
        <header>
          <h2>{pr.title}</h2>
          <p>{viewerText.authorLabel}: {pr.author}</p>
        </header>
        <p className={styles.prDescription}>{pr.description}</p>
        <div className={styles.tagList}>
          {pr.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </article>
      <div className={styles.diffHintBanner}>
        <p>{viewerText.diffTip(requestLabel)}</p>
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
