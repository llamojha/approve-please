import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTranslations } from '../../hooks/useTranslations';
import { evaluateDecision, type DecisionReceipt, type ReviewVerdict } from '../../utils/decision';
import { normalizePullRequest } from '../../utils/templateNormalization';
import type { MeterSet, PullRequest } from '../../types';
import styles from '../../styles/DesignStudy.module.css';

const initialMeters: MeterSet = { stability: 92, velocity: 74, satisfaction: 86 };
const people = ['lucia', 'diego'] as const;
type Person = typeof people[number];
const names = { lucia: 'Lucía Navarro', diego: 'Diego Martín' };
const lines = {
  lucia: ["export function EmptyWorkspace({ onCreate }: Props) {", "  return (", "    <section aria-labelledby=\"empty-title\">", "      <span aria-hidden=\"true\">✦</span>", "      <h2 id=\"empty-title\">A little space for big ideas.</h2>", "      <p>Your team's next chapter starts here.</p>", "      <button type=\"button\" onClick={onCreate}>", "        Create your first project", "      </button>", "    </section>", "  );", "}"],
  diego: ["export async function getAccount(req: Request) {", "  const session = await requireSession(req);", "  const account = await db.account.findUnique({", "    where: { id: session.accountId },", "  });", "", "  logger.info('Account loaded', {", "    accountId: account.id,", "    accessToken: session.accessToken,", "  });", "", "  return Response.json({ name: account.name });", "}"],
};
function Portrait({ person, expression = 'neutral', size = 48 }: { person: Person; expression?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = `/characters/studies/${person}-${expression}.png`;
  useEffect(() => setFailed(false), [src]);
  return <span className={`${styles.portrait} ${styles[person]}`} style={{ width: size, height: size }}>
    {failed ? <span aria-label={names[person]}>{person === 'lucia' ? 'LN' : 'DM'}</span> :
      // Source illustrations are deliberately rendered at several study sizes.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} width={size} height={size} alt={names[person]} onError={() => setFailed(true)} />}
  </span>;
}
export default function DesignStudy() {
  const t = useTranslations().designStudy;
  const { locale, setLocale } = useLocale();
  const [dark, setDark] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [view, setView] = useState<'desk' | 'cast'>('desk');
  const [person, setPerson] = useState<Person>('lucia');
  const [selected, setSelected] = useState<number[]>([]);
  const [receipt, setReceipt] = useState<(DecisionReceipt & { person: Person }) | null>(null);
  const [meters, setMeters] = useState(initialMeters);
  const [panel, setPanel] = useState<'rules' | 'queue' | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (panel) { previousFocus.current = document.activeElement as HTMLElement; dialog.current?.showModal(); }
    else { dialog.current?.close(); previousFocus.current?.focus(); }
  }, [panel]);
  const title = (who: Person) => who === 'lucia' ? t.luciaTitle : t.diegoTitle;
  const role = (who: Person) => who === 'lucia' ? t.luciaRole : t.diegoRole;
  const filename = person === 'lucia' ? 'src/components/EmptyWorkspace.tsx' : 'src/api/account.ts';
  const choose = (who: Person) => { setPerson(who); setSelected([]); setCompleted(false); setPanel(null); };
  const decide = (verdict: ReviewVerdict) => {
    if (empty || completed) return;
    const pr: PullRequest = { id: person, templateId: `design-study-${person}`, title: title(person), author: names[person], authorId: person,
      description: '', tags: [], importance: 'normal', estimatedReviewSeconds: 30,
      files: [{ filename, language: 'typescript', lines: lines[person].map((content, i) => ({ content, lineNumber: i + 1, isNew: i >= 2 && i <= 8 })) }],
      bugPatterns: person === 'diego' ? [{ kind: 'security', severity: 'critical', lineNumbers: [9] }] : [] };
    const result = evaluateDecision(normalizePullRequest(pr), verdict, selected.map(n => ({ filename, rowId: `line-${n}` })), meters);
    setReceipt({ ...result, person }); setMeters(result.metersAfter); setCompleted(true);
  };
  const queue = <><div className={styles.queueHeading}><span>{t.waiting}</span><span>{empty ? '00' : '02'}</span></div>{empty ? <p className={styles.emptyQueue}>{t.emptyHint}</p> : people.map((who, i) => <button key={who} className={`${styles.queueItem} ${person === who ? styles.activeQueue : ''}`} onClick={() => choose(who)} aria-pressed={person === who}><div className={styles.queueMeta}><Portrait person={who} size={32} /><span>{names[who].split(' ')[0]}</span><span>#{248 + i}</span></div><strong>{title(who)}</strong><small><span className={styles.dot} />{who === 'lucia' ? 'UI · TypeScript' : 'API · TypeScript'}</small></button>)}</>;
  const precision = receipt ? ({ precise: t.precise, untagged: t.untagged, inaccurate: t.inaccurate, mixed: t.mixed, 'not-applicable': t.notApplicable }[receipt.precision]) : '';
  const outcome = receipt ? ({ 'clean-approval': t.cleanOutcome, 'correct-rejection': t.caughtOutcome, 'buggy-approval': t.escapedOutcome, 'false-positive': t.falseOutcome }[receipt.outcome]) : '';
  return <div className={styles.study} data-dark={dark}>
    <Head><title>{`Approve Please · ${t.preview}`}</title></Head>
    <header className={styles.topbar}><Link className={styles.brand} href="/dev/design"><span className={styles.brandIcon}>↳</span>approve<span>please</span><span className={styles.brandPeriod}>.</span></Link><nav aria-label={t.preview}><button aria-pressed={view === 'desk'} onClick={() => setView('desk')}>{t.desk}</button><button aria-pressed={view === 'cast'} onClick={() => setView('cast')}>{t.cast}</button></nav><div className={styles.preferences}><button aria-label={t.theme} onClick={() => setDark(!dark)}>{dark ? '☀' : '◐'} <span>{dark ? t.changeThemeLight : t.changeThemeDark}</span></button><button onClick={() => setLocale(locale === 'en' ? 'es' : 'en')} aria-label={locale === 'en' ? 'Cambiar a español' : 'Switch to English'}>{locale.toUpperCase()} ↔</button></div></header>
    <div className={styles.previewBar}><span>{t.preview}</span><span>{t.previewNote}</span><label className={styles.previewControl}>{t.previewState}<select aria-controls="study-review" value={empty ? 'empty' : 'active'} onChange={e => { setEmpty(e.target.value === 'empty'); setSelected([]); }}><option value="active">{t.activeState}</option><option value="empty">{t.emptyState}</option></select></label></div>
    {view === 'cast' ? <main className={styles.cast}><span className={styles.eyebrow}>{t.cast}</span><h1>{t.teamHeading}</h1><p>{t.teamIntro}</p><div className={styles.castGrid}>{people.map(who => <section className={styles.castCard} key={who}><div className={styles.castName}><h2>{names[who]}</h2><span>{role(who)}</span></div><div className={styles.expressions}>{(['neutral', 'pleased', 'concerned'] as const).map(expression => <figure key={expression}><Portrait person={who} expression={expression} size={160} /><figcaption>{t[expression]}</figcaption></figure>)}</div><div className={styles.scale}><span>{t.scale}</span><Portrait person={who} size={32} /><Portrait person={who} size={48} /></div><blockquote>{who === 'lucia' ? t.luciaMessage : t.diegoMessage}</blockquote></section>)}</div><p>{t.portraitNote}</p><button className={styles.primary} onClick={() => setView('desk')}>{t.back} ↗</button></main> : <>
      <div className={styles.shiftbar}><div><span className={styles.eyebrow}>{t.shift}</span><strong>{t.time}<span> / 17:00</span></strong></div><div className={styles.meters}>{(Object.keys(meters) as (keyof MeterSet)[]).map(key => <div key={key}><span>{t[key]}<b>{meters[key]}<small>/100</small></b></span><i><em style={{ width: `${meters[key]}%` }} /></i></div>)}</div><span className={styles.shiftStamp}>↗ <span>{t.deskTitle}</span></span></div>
      <div className={styles.workspace}><aside className={styles.sidebar}><h1>{t.queue}</h1><p>{t.queueHint}</p>{queue}<div className={styles.sidebarBottom}><span className={styles.handbookIcon}>⌘</span><h3>{t.rulesIntro}</h3><button onClick={() => setPanel('rules')}>{t.rules} ↗</button><small>{t.liveRules}</small></div></aside>
      <main id="study-review" className={styles.main}><div className={styles.mobileTools}><button onClick={() => setPanel('queue')}>{t.queue} · {empty ? '00' : '02'}</button><button onClick={() => setPanel('rules')}>{t.rules} ↗</button></div>{empty ? <section className={styles.emptyReview}><span aria-hidden>✓</span><h1>{t.emptyTitle}</h1><p>{t.emptyBody}</p><button onClick={() => setPanel('rules')}>{t.rules} ↗</button></section> : <><div className={styles.repo}><span>◇ {t.repository}</span><span>{t.sample} #{person === 'lucia' ? 248 : 249}</span></div><div className={styles.prHeading}><div><h1>{title(person)}</h1><div className={styles.author}><Portrait person={person} size={48} /><div><strong>{names[person]}</strong><span>{role(person)}</span></div><span className={styles.openBadge}>● {completed ? t.reviewedBadge : t.open}</span></div></div><span className={styles.prGlyph} aria-hidden>↳</span></div><p className={styles.description}>{person === 'lucia' ? t.luciaDescription : t.diegoDescription}</p>
      <section className={styles.diff} aria-label={t.codeLabel}><div className={styles.fileHeader}><span>▧ <strong>{filename}</strong></span><span className={styles.additionCount}>+7 <span>{t.additions}</span></span></div><div className={styles.codeScroll} tabIndex={0} aria-label={t.codeLabel}><div className={styles.hunk}>@@ {person === 'lucia' ? '-1,5 +1,12' : '-1,6 +1,13'} @@</div>{lines[person].map((line, i) => <button key={`${person}-${i}`} className={`${styles.codeLine} ${i >= 2 && i <= 8 ? styles.addition : ''} ${selected.includes(i + 1) ? styles.selected : ''}`} disabled={completed} aria-pressed={selected.includes(i + 1)} aria-label={`${t.select} ${i + 1}: ${line}`} onClick={() => setSelected(s => s.includes(i + 1) ? s.filter(n => n !== i + 1) : [...s, i + 1])}><span className={styles.lineNumber}>{i + 1}</span><span className={styles.lineMarker}>{selected.includes(i + 1) ? '●' : i >= 2 && i <= 8 ? '+' : ' '}</span><code>{line || ' '}</code></button>)}</div></section></>}
      <div className={styles.decisionBar}><div><strong>{empty ? t.emptyHint : completed ? t.completed : selected.length ? `${selected.length} ${t.selected}` : t.optional}</strong>{selected.length > 0 && !completed && <button onClick={() => setSelected([])}>{t.clear}</button>}</div><div className={styles.verdicts}><button className={styles.request} disabled={empty || completed} onClick={() => decide('request-changes')}>↶ {t.request}</button><button className={styles.primary} disabled={empty || completed} onClick={() => decide('approve')}>✓ {t.approve}</button></div></div>
      <section className={`${styles.receipt} ${receipt && !receipt.correct ? styles.warningReceipt : ''}`} aria-live="polite" aria-label={t.rationale}>{receipt ? <><Portrait person={receipt.person} expression={receipt.correct ? 'pleased' : 'concerned'} size={48} /><div className={styles.receiptCopy}><span className={styles.eyebrow}>{t.receipt} · #{receipt.person === 'lucia' ? 248 : 249} · {names[receipt.person]}</span><strong>{receipt.correct ? t.correct : t.incorrect} <span>{outcome}</span></strong><small>{precision}</small><div className={styles.deltas}>{(Object.keys(receipt.appliedMeterDelta) as (keyof MeterSet)[]).map(key => <span key={key}>{t[key]} <b>{receipt.appliedMeterDelta[key] > 0 ? '+' : ''}{receipt.appliedMeterDelta[key]}</b></span>)}</div></div><button className={styles.nextButton} disabled={empty} onClick={() => choose(person === 'lucia' ? 'diego' : 'lucia')} aria-label={t.next}>→</button></> : <><span className={styles.receiptSymbol}>✓</span><div><strong>{t.noReceipt}</strong><p>{t.receiptHint}</p></div></>}</section>
      <footer className={styles.studyFooter}><span>{t.nextHint}</span><button onClick={() => { setReceipt(null); setMeters(initialMeters); setSelected([]); setPerson('lucia'); setCompleted(false); setEmpty(false); }}>{t.reset} ↺</button></footer></main></div>
    </>}
    <dialog ref={dialog} className={styles.dialog} onCancel={e => { e.preventDefault(); setPanel(null); }} onClick={e => { if (e.target === dialog.current) setPanel(null); }} aria-labelledby="study-dialog-title"><div className={styles.dialogTop}><h2 id="study-dialog-title">{panel === 'queue' ? t.queue : t.handbookTitle}</h2><button onClick={() => setPanel(null)} aria-label={t.close}>×</button></div>{panel === 'queue' ? queue : <><span className={styles.handbookIcon}>⌘</span><h3>{t.rulesIntro}</h3><p>{t.rulesBody}</p><p>{t.emptySelection}</p><small>{t.rulesNote}</small></>}</dialog>
  </div>;
}
export const getServerSideProps: GetServerSideProps = async () => process.env.NODE_ENV === 'production' ? { notFound: true } : { props: {} };
