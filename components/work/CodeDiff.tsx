import type { LineReference, PRFileDiff } from '../../types';
import styles from '../../styles/ReviewDesk.module.css';

export interface CodeDiffProps {
  files: PRFileDiff[];
  selected: LineReference[];
  onToggle: (reference: LineReference) => void;
  disabled?: boolean;
  labels: { codeLabel: string; select: string; additions: string; language: string };
}

/** File-scoped row identities avoid collisions between equal line numbers. */
export default function CodeDiff({ files, selected, onToggle, disabled = false, labels }: CodeDiffProps) {
  return <div className={styles.diffStack}>
    {files.map(file => <section key={file.filename} className={styles.diff} aria-label={`${labels.codeLabel}: ${file.filename}`}>
      <div className={styles.fileHeader}><span>▧ <strong>{file.filename}</strong> <small aria-label={`${labels.language}: ${file.language}`}>{file.language}</small></span><span className={styles.additionCount}>+{file.lines.filter(line => line.kind === 'addition' || (!line.kind && line.isNew)).length} <span>{labels.additions}</span></span></div>
      <div className={styles.codeScroll} tabIndex={0} aria-label={`${labels.codeLabel}: ${file.filename}`}>
        {file.lines.map(line => {
          const reference = { filename: file.filename, rowId: line.rowId ?? `line-${line.lineNumber}` };
          const tagged = selected.some(item => item.filename === reference.filename && item.rowId === reference.rowId);
          const addition = line.kind === 'addition' || (!line.kind && line.isNew);
          return <button key={reference.rowId} className={`${styles.codeLine} ${addition ? styles.addition : ''} ${tagged ? styles.selected : ''}`} disabled={disabled} aria-pressed={tagged} aria-label={`${labels.select} ${file.filename}:${line.lineNumber}: ${line.content}`} onClick={() => onToggle(reference)}>
            <span className={styles.lineNumber}>{line.lineNumber}</span><span className={styles.lineMarker}>{tagged ? '●' : addition ? '+' : ' '}</span><code>{line.content || ' '}</code>
          </button>;
        })}
      </div>
    </section>)}
  </div>;
}
