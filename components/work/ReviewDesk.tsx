import type { ReactNode } from 'react';
import CharacterAvatar, { type CharacterExpression } from '../common/CharacterAvatar';
import CodeDiff from './CodeDiff';
import type { LineReference, PullRequest } from '../../types';
import type { ReviewVerdict } from '../../utils/decision';
import styles from '../../styles/ReviewDesk.module.css';

export interface ReviewDeskLabels {
  queue: string; rules: string; open: string; reviewedBadge: string; priority: string;
  branch: string; prDescription: string; authorNote: (name: string) => string;
  codeLabel: string; select: string; additions: string; selected: string; optional: string;
  clear: string; request: string; approve: string; tags: string; language: string;
}
export interface ReviewDeskProps {
  pullRequest: PullRequest;
  repository: string;
  number: string | number;
  branch?: string;
  authorRole?: string;
  expression?: CharacterExpression;
  selected: LineReference[];
  onToggle: (reference: LineReference) => void;
  onClear: () => void;
  onVerdict: (verdict: ReviewVerdict) => void;
  disabled?: boolean;
  swipe?: ReviewVerdict | null;
  queueCount: number;
  onOpenQueue: () => void;
  onOpenRules: () => void;
  labels: ReviewDeskLabels;
  importanceLabels: Record<PullRequest['importance'], string>;
  status?: string;
  children?: ReactNode;
}

/** Presentation only: clocks, answers, scoring and queue progression belong to the caller. */
export default function ReviewDesk({ pullRequest: pr, repository, number, branch, authorRole, expression = 'neutral', selected, onToggle, onClear, onVerdict, disabled = false, swipe, queueCount, onOpenQueue, onOpenRules, labels: t, importanceLabels, status, children }: ReviewDeskProps) {
  const locked = disabled || Boolean(swipe);
  return <main className={styles.main} data-swipe={swipe ?? undefined}>
    <div className={styles.mobileTools}><button onClick={onOpenQueue}>{t.queue} · {queueCount}</button><button onClick={onOpenRules}>{t.rules} ↗</button></div>
    <div className={styles.repo}><span>◇ {repository}</span><span>PR #{number}</span></div>
    <div className={styles.prHeading}><div><h1>{pr.title}</h1><div className={styles.author}>
      <CharacterAvatar characterId={pr.authorId} name={pr.author} expression={expression} />
      <div><strong>{pr.author}</strong>{authorRole && <span>{authorRole}</span>}</div>
      <span className={styles.openBadge}>● {swipe ? t.reviewedBadge : t.open}</span>
      <span className={styles.priority} data-priority={pr.importance}>{t.priority}: {importanceLabels[pr.importance]}</span>
    </div></div><span className={styles.prGlyph} aria-hidden>↳</span></div>
    {branch && <p className={styles.description}>{t.branch}: {branch}</p>}
    {pr.tags.length > 0 && <div className={styles.tags} aria-label={t.tags}>{pr.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
    {pr.description && <section className={styles.authorNote} aria-label={t.prDescription}><div><h2>{t.prDescription}</h2><span>{t.authorNote(pr.author)}</span></div><p>{pr.description}</p></section>}
    {children}
    <CodeDiff files={pr.files} selected={selected} onToggle={onToggle} disabled={locked} labels={t} />
    <div className={styles.decisionBar}><div><strong>{selected.length ? `${selected.length} ${t.selected}` : t.optional}</strong>{selected.length > 0 && !locked && <button onClick={onClear}>{t.clear}</button>}</div><div className={styles.verdicts}><button data-review-action="request" className={styles.request} disabled={locked} onClick={() => onVerdict('request-changes')}>↶ {t.request}</button><button data-review-action="approve" className={styles.primary} disabled={locked} onClick={() => onVerdict('approve')}>✓ {t.approve}</button></div></div>
    <span className={styles.screenReaderStatus} role="status">{status ?? ''}</span>
  </main>;
}
