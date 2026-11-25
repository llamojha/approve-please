import type { BasicsExercise } from '../../data/basics/types';
import type { Locale } from '../../types';
import { basicsCopy } from '../../constants/basicsCopy';
import { diffText, evidenceKeys, rowKey } from '../../utils/basics';
import styles from '../../styles/Basics.module.css';

interface Props { exercise: BasicsExercise; locale: Locale; selected: string[]; onToggle: (key: string) => void; disabled: boolean; reveal: boolean }
export default function PlainTextDiff({ exercise, locale, selected, onToggle, disabled, reveal }: Props) {
  const t = basicsCopy[locale];
  const evidence = new Set(reveal ? evidenceKeys(exercise) : []);
  return <div className={styles.diffStack}>
    <p className={styles.legend}>{t.legend}</p>
    {exercise.files.map(file => {
      const rows = diffText(file.before[locale], file.after[locale]);
      return <section className={styles.file} key={file.filename} aria-label={`${t.diff}: ${file.filename}`}>
        <header><h2>{file.filename}</h2><span>+{rows.filter(row => row.kind === 'addition').length} / −{rows.filter(row => row.kind === 'removal').length}</span></header>
        <div className={styles.numberHead} aria-hidden="true"><span>{t.before}</span><span>{t.after}</span></div>
        {rows.map(row => {
          const key = rowKey(file.filename, row.id);
          const kind = row.kind === 'addition' ? t.additions : row.kind === 'removal' ? t.removed : t.unchanged;
          return <button key={row.id} type="button" className={styles.diffRow} data-kind={row.kind} data-evidence={evidence.has(key)}
            disabled={disabled} aria-pressed={selected.includes(key)} aria-label={`${t.select}: ${file.filename}, ${kind}, ${row.before ?? row.after}: ${row.content}`}
            onClick={() => onToggle(key)}>
            <span aria-hidden="true">{row.before ?? ''}</span><span aria-hidden="true">{row.after ?? ''}</span>
            <b aria-hidden="true">{row.kind === 'addition' ? '+' : row.kind === 'removal' ? '−' : ' '}</b><span>{row.content || ' '}</span>
            {evidence.has(key) && <strong className={styles.evidenceLabel}>{t.evidence}</strong>}
          </button>;
        })}
      </section>;
    })}
  </div>;
}
