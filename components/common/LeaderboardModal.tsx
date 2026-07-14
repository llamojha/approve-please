import { useEffect, useState } from "react";
import styles from "../../styles/LeaderboardModal.module.css";

import type { Difficulty } from "../../types";
import { useLeaderboardEntries } from "../../hooks/useLeaderboardEntries";

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

  // Sync activeMode when the modal opens with a different mode prop
  useEffect(() => {
    if (isOpen) setActiveMode(mode);
  }, [isOpen, mode]);

  const { entries, loading, error } = useLeaderboardEntries(activeMode, {
    limit: 50,
    enabled: isOpen,
  });

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
