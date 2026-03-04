import { useEffect, useState } from "react";
import styles from "../../styles/LeaderboardModal.module.css";
import { getSupabaseAnonClient } from "../../utils/supabaseClient";

import type { Difficulty } from "../../types";

type LeaderboardEntry = {
  displayName: string;
  cleanApprovals: number;
  truePositives: number;
  daysPlayed: number;
  score: number;
  createdAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: Difficulty;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const MODES: Difficulty[] = ["normal", "learning"];

const LeaderboardModal = ({ isOpen, onClose, mode }: Props) => {
  const [activeMode, setActiveMode] = useState<Difficulty>(mode);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync activeMode when the modal opens with a different mode prop
  useEffect(() => {
    if (isOpen) setActiveMode(mode);
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseAnonClient();
        if (!supabase) {
          throw new Error("Leaderboard is not configured.");
        }
        const { data, error: fetchError } = await supabase
          .from("leaderboard_entries")
          .select(
            "display_name, clean_approvals, true_positives, days_played, score, created_at"
          )
          .eq("mode", activeMode)
          .order("score", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(50);
        if (fetchError) throw new Error(fetchError.message);
        if (!alive) return;
        setEntries(
          (data ?? []).map((row) => ({
            displayName: row.display_name ?? "Anonymous reviewer",
            cleanApprovals: row.clean_approvals ?? 0,
            truePositives: row.true_positives ?? 0,
            daysPlayed: row.days_played ?? 0,
            score: row.score ?? 0,
            createdAt: row.created_at,
          }))
        );
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Leaderboard</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.tabs}>
          {MODES.map((m) => (
            <button
              key={m}
              className={`${styles.tab} ${m === activeMode ? styles.tabActive : ""}`}
              onClick={() => setActiveMode(m)}
            >
              {m === "normal" ? "Normal" : "Learning"}
            </button>
          ))}
        </div>
        <div className={styles.content}>
          {loading && <div className={styles.muted}>Loading…</div>}
          {error && <div className={styles.muted}>Error: {error}</div>}
          {!loading && !error && entries.length === 0 && (
            <div className={styles.muted}>No entries yet. Be the first!</div>
          )}
          {!loading && !error && entries.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Days</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={`${entry.createdAt}-${idx}`}
                    className={idx < 3 ? styles.topThree : ""}
                  >
                    <td className={styles.rank}>{idx + 1}</td>
                    <td className={styles.name}>{entry.displayName}</td>
                    <td className={styles.score}>{entry.score}</td>
                    <td>{entry.daysPlayed}</td>
                    <td className={styles.date}>
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
