import { ReactNode } from 'react';
import styles from '../../styles/Desk.module.css';
import { PullRequest } from '../../types';
import TutorialHint from '../tutorial/TutorialHint';
import { useTranslations } from '../../hooks/useTranslations';
import { shortPrNumber, summarizeDiff, authorInitials } from '../../utils/helpers';

interface PRViewerProps {
  pr: PullRequest | null;
  selectedLines: number[];
  onToggleLine: (lineNumber: number) => void;
  actionSlot?: ReactNode;
}

const PRViewer = ({ pr, selectedLines, onToggleLine, actionSlot }: PRViewerProps) => {
  const translations = useTranslations();
  const viewerText = translations.work.prViewer;

  if (!pr) {
    return (
      <div className={styles.prPlaceholder}>
        <p>{viewerText.placeholder}</p>
      </div>
    );
  }

  const selected = new Set(selectedLines);
  const summary = summarizeDiff(pr);

  return (
    <>
      <div className={styles.stageHeader}>
        <div className={styles.prIdRow}>
          <span className={styles.prId}>{shortPrNumber(pr.id)}</span>
          <span className={styles.statusPill}>OPEN</span>
        </div>
        <h2 className={styles.prTitle}>{pr.title}</h2>
        <div className={styles.prBranchRow}>
          <span className={styles.prAvatar}>{authorInitials(pr.author)}</span>
          <span className={styles.prBranchText}>
            {pr.author} → <span className={styles.branchTag}>main</span>
          </span>
        </div>
        <p className={styles.prDescription}>{pr.description}</p>
        {pr.tags.length > 0 && (
          <div className={styles.prTags}>
            {pr.tags.map((tag) => (
              <span key={tag} className={styles.prTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className={styles.prTabs}>
          <span className={`${styles.prTab} ${styles.prTabActive}`}>
            FILES CHANGED · {summary.fileCount}
          </span>
          <span className={styles.prTab}>CONVERSATION</span>
          <span className={styles.prDiffStat}>
            +{summary.additions} <span className={styles.diffStatDel}>−{summary.removals}</span>
          </span>
        </div>
      </div>
      <div className={styles.diffScroll}>
        {pr.files.map((file) => (
          <section key={file.filename} className={styles.diffSection}>
            <header className={styles.diffHeader}>
              <span className={styles.diffFilename}>{file.filename}</span>
              <span className={styles.diffHint}>
                CLICK A LINE № TO TAG IT
                <TutorialHint text={viewerText.hintLines} />
              </span>
            </header>
            <div className={styles.diffLines}>
              {file.lines.map((line) => {
                const isSelected = selected.has(line.lineNumber);
                const className = [
                  styles.diffLine,
                  line.isNew ? styles.diffLineAdd : styles.diffLineDel,
                  isSelected ? styles.diffLineSelected : ''
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    type="button"
                    key={`${file.filename}-${line.lineNumber}`}
                    className={className}
                    onClick={() => onToggleLine(line.lineNumber)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.lineNumber}>{line.lineNumber}</span>
                    <span className={`${styles.lineSign} ${line.isNew ? styles.lineSignAdd : styles.lineSignDel}`}>
                      {line.isNew ? '+' : '−'}
                    </span>
                    <span className={line.isNew ? styles.lineContentNew : styles.lineContentOld}>{line.content}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {actionSlot && <div className={styles.prActions}>{actionSlot}</div>}
    </>
  );
};

export default PRViewer;
