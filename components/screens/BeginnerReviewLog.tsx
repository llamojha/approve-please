import { useState } from 'react';
import CharacterAvatar from '../common/CharacterAvatar';
import { useLocale } from '../../context/LocaleContext';
import { basicsCopy } from '../../constants/basicsCopy';
import { basicsDay, basicsExercise } from '../../utils/basicsGame';
import type { DecisionReceipt } from '../../utils/decision';
import type { PullRequest } from '../../types';
import styles from '../../styles/ReviewLog.module.css';

interface Props { day: number; receipts: DecisionReceipt[]; pending: PullRequest[] }

export default function BeginnerReviewLog({ day, receipts, pending }: Props) {
  const { locale } = useLocale();
  const t = basicsCopy[locale];
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const mistakes = receipts.filter(receipt => !receipt.correct).length;
  const visible = onlyMistakes ? receipts.filter(receipt => !receipt.correct) : receipts;

  return <section className={styles.log} aria-labelledby="review-log-heading">
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>{basicsDay(day)?.title[locale]}</p><h2 id="review-log-heading">{t.recap}</h2></div>
      {receipts.length > 0 && <div className={styles.score}><strong>{receipts.length - mistakes}<span> / {receipts.length}</span></strong><span>{t.logScore}</span></div>}
    </header>
    <div className={styles.filters} role="group" aria-label={t.filterReviews}>
      <button type="button" aria-pressed={!onlyMistakes} onClick={() => setOnlyMistakes(false)}>{t.allReviews}<span>{receipts.length}</span></button>
      <button type="button" aria-pressed={onlyMistakes} onClick={() => setOnlyMistakes(true)}>{t.revisit}<span>{mistakes}</span></button>
    </div>
    {visible.length === 0 && <p className={styles.empty}>{receipts.length === 0 ? t.noReviews : t.noMistakes}</p>}
    <div className={styles.list}>
      {visible.map(receipt => {
        const exercise = basicsExercise(receipt.templateId);
        if (!exercise) return null;
        return <details key={receipt.prId} className={styles.card} data-correct={receipt.correct} open={!receipt.correct}>
          <summary className={styles.row}>
            <CharacterAvatar characterId={receipt.authorId ?? exercise.authorId} name={receipt.author} size={40} expression={receipt.correct ? 'pleased' : 'concerned'} />
            <span className={styles.title}><strong>{exercise.title[locale]}</strong><small>{receipt.author}<span aria-hidden="true"> · </span>{receipt.verdict === 'approve' ? t.approved : t.rejected}</small></span>
            <span className={styles.outcome}><span aria-hidden="true">{receipt.correct ? '✓' : '↳'}</span> {receipt.correct ? t.correct : t.revisit}</span>
            <svg className={styles.chevron} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </summary>
          <div className={styles.body}>
            <dl className={styles.decisions}>
              <div><dt>{t.yourDecision}</dt><dd data-verdict={receipt.verdict}>{receipt.verdict === 'approve' ? `✓ ${t.logApprove}` : `✕ ${t.logReject}`}</dd></div>
              <div><dt>{t.correctDecision}</dt><dd>{exercise.issues.length ? `✕ ${t.logReject}` : `✓ ${t.logApprove}`}</dd></div>
            </dl>
            <div className={styles.explanation}>
              <section><h3>{t.prDescription}</h3><p>{exercise.brief[locale]}</p></section>
              <section className={styles.notes}><h3>{t.reviewNotes}</h3><p>{exercise.explanation[locale]}</p></section>
            </div>
            {exercise.issues.length > 0 && <section className={styles.evidence}><h3>{t.evidence}</h3><ul>{exercise.issues.map(issue => {
              const file = exercise.files.find(item => item.filename === issue.filename)!;
              const removed = issue.side === 'before';
              const content = (removed ? file.before : file.after)[locale][issue.line - 1];
              return <li key={`${issue.filename}-${issue.side}-${issue.line}`} data-removed={removed}><span><strong>{issue.filename}:{issue.line}</strong><small>{removed ? t.removedLine : t.addedLine}</small></span><code><span aria-hidden="true">{removed ? '−' : '+'} </span>{content}</code></li>;
            })}</ul></section>}
          </div>
        </details>;
      })}
    </div>
    {pending.length > 0 && <section className={styles.pending}>
      <div><h3>{t.unreviewed}<span>{pending.length}</span></h3><p>{t.unreviewedBody}</p></div>
      <ul>{pending.map(pr => <li key={pr.id}><CharacterAvatar characterId={pr.authorId} name={pr.author} size={32} /><span><strong>{basicsExercise(pr.templateId)?.title[locale] ?? pr.title}</strong><small>{pr.author}</small></span><span className={styles.pendingBadge}>{t.notReviewed}</span></li>)}</ul>
    </section>}
  </section>;
}
