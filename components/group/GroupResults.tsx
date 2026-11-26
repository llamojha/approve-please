import { useLocale } from '../../context/LocaleContext';
import { useTranslations } from '../../hooks/useTranslations';
import { basicsCopy } from '../../constants/basicsCopy';
import CharacterAvatar from '../common/CharacterAvatar';
import type { GroupSnapshot } from '../../types/groupSessions';
import styles from '../../styles/GroupSessions.module.css';
import log from '../../styles/ReviewLog.module.css';

export function GroupResults({room}:{room:GroupSnapshot}) {
  const {locale}=useLocale();const t=useTranslations().group;
  const mine=room.results.find(row=>row.id===room.me?.id);
  return <main className={styles.page}>
    <header className={styles.hero}><p className={styles.eyebrow}>{t.room} {room.code} · {t.eyebrow}</p><h1>{t.results}</h1><p>{t.resultsBody}</p>
      {mine && <div className={styles.score}>{mine.correct}/{room.total}<small>{t.accuracy} · #{mine.rank}</small></div>}
    </header>
    <section className={styles.card}><h2>{t.leaderboard}</h2><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={t.leaderboard}><table className={styles.table}><thead><tr>{[t.rank,t.name,t.correct,t.approvals,t.rejections,t.missed,t.safeRejected,t.unreviewed].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{room.results.map(row=><tr key={row.id} data-me={row.id===room.me?.id}><td>#{row.rank}</td><th scope="row">{row.name}</th><td>{row.correct}/{room.total}</td><td>{row.correctApprovals}</td><td>{row.correctRejections}</td><td>{row.missed}</td><td>{row.safeRejected}</td><td>{room.total-row.reviewed}</td></tr>)}</tbody></table></div></section>
    {room.reviews.length>0 && <section className={log.log}><header className={log.header}><h2>{t.personal}</h2></header><div className={log.list}>{room.reviews.map(review=>{
      const expectedApprove=review.correct ? review.verdict==='approve' : review.verdict!=='approve';
      return <details key={review.pr.id} className={log.card} data-correct={review.correct} open={!review.correct}>
        <summary className={log.row}><CharacterAvatar characterId={review.pr.authorId} name={review.pr.author} size={40} expression={review.correct?'pleased':'concerned'} /><span className={log.title}><strong>{review.pr.title}</strong><small>{review.pr.author} · {review.verdict==='approve'?t.youApproved:t.youRejected}</small></span><span className={log.outcome}>{review.correct?'✓':'↳'} {review.correct?t.good:t.revisit}</span><svg className={log.chevron} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></summary>
        <div className={log.body}><dl className={log.decisions}><div><dt>{basicsCopy[locale].yourDecision}</dt><dd>{review.verdict==='approve'?'✓':'✕'} {review.verdict==='approve'?t.expectedApprove:t.expectedReject}</dd></div><div><dt>{basicsCopy[locale].correctDecision}</dt><dd>{expectedApprove?'✓':'✕'} {expectedApprove?t.expectedApprove:t.expectedReject}</dd></div></dl>
          <div className={log.explanation}><section><h3>{t.description}</h3><p>{review.pr.description}</p></section><section className={log.notes}><h3>{t.explanation}</h3><p>{review.explanation}</p></section></div>
          {review.evidence?.length>0 && <section className={log.evidence}><h3>{basicsCopy[locale].evidence}</h3><ul>{review.evidence.map(line=><li key={`${line.filename}-${line.rowId}`}><span><strong>{line.filename}:{line.lineNumber}</strong></span><code>{line.content}</code></li>)}</ul></section>}
        </div>
      </details>;
    })}</div></section>}
    <section className={styles.card}><h2>{t.recap}</h2><p className={styles.muted}>{t.recapBody}</p><ul className={styles.recapList}>{room.recap.map(pr=><li key={pr.prId}><header><strong>{pr.title}</strong><span>{pr.correct}/{room.players.length} {t.correct.toLowerCase()}</span></header><span className={styles.expected}>{pr.expected==='approve'?'✓':'✕'} {pr.expected==='approve'?t.expectedApprove:t.expectedReject} · {pr.reviewed}/{room.players.length} {t.reviewed}</span><p>{pr.explanation}</p></li>)}</ul></section>
  </main>;
}
