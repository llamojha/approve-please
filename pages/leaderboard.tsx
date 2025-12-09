import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Leaderboard.module.css';

type LeaderboardEntry = {
  displayName: string;
  cleanApprovals: number;
  truePositives: number;
  daysPlayed: number;
  score: number;
  createdAt: string;
};

const rankBadge = (rank: number) => {
  if (rank === 1) return styles.badge;
  if (rank === 2) return `${styles.badge} ${styles.silver}`;
  if (rank === 3) return `${styles.badge} ${styles.bronze}`;
  return '';
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
      new Date(value)
    );
  } catch {
    return value;
  }
};

const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const payload = await res.json();
        if (!alive) return;
        setEntries(payload.entries ?? []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const withRanks = useMemo(
    () => entries.map((entry, idx) => ({ ...entry, rank: idx + 1 })),
    [entries]
  );

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Leaderboard</h1>
            <div className={styles.meta}>Top runs across all days</div>
          </div>
          <div className={styles.actions}>
            <Link className={`${styles.button} ${styles.secondary}`} href="/">
              ← Back to Home
            </Link>
          </div>
        </div>

        {loading && <div className={styles.muted}>Loading leaderboard…</div>}
        {error && <div className={styles.muted}>Error: {error}</div>}
        {!loading && !error && withRanks.length === 0 && (
          <div className={`${styles.muted} ${styles.empty}`}>No entries yet. Finish a run and submit your score!</div>
        )}

        {!loading && !error && withRanks.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Clean Approvals</th>
                  <th>True Positives</th>
                  <th>Days Played</th>
                  <th>Last Played</th>
                </tr>
              </thead>
              <tbody>
                {withRanks.map((entry) => (
                  <tr key={`${entry.displayName}-${entry.createdAt}-${entry.rank}`}>
                    <td className={styles.rank}>
                      {entry.rank <= 3 ? <span className={rankBadge(entry.rank)}>{entry.rank}</span> : entry.rank}
                    </td>
                    <td>{entry.displayName}</td>
                    <td className={styles.score}>{entry.score}</td>
                    <td>{entry.cleanApprovals}</td>
                    <td>{entry.truePositives}</td>
                    <td>{entry.daysPlayed}</td>
                    <td className={styles.muted}>{formatDate(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default LeaderboardPage;
