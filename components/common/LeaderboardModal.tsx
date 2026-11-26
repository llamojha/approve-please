import { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import { useLocale } from "../../context/LocaleContext";
import styles from "../../styles/LeaderboardModal.module.css";

import type { Difficulty } from "../../types";
import { useLeaderboardEntries } from "../../hooks/useLeaderboardEntries";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: Difficulty;
};

const formatDate = (value: string | null | undefined, locale: string) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
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
  const dialog = useRef<HTMLDialogElement>(null);
  const translations = useTranslations();
  const t = translations.landing.refresh;
  const { locale } = useLocale();

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const modal = dialog.current;
    modal?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  // Sync activeMode when the modal opens with a different mode prop
  useEffect(() => {
    if (isOpen) setActiveMode(mode);
  }, [isOpen, mode]);

  const { entries, loading, error } = useLeaderboardEntries(activeMode, {
    limit: 50,
    enabled: isOpen,
  });

  return (
    <dialog ref={dialog} className={styles.overlay} aria-labelledby="leaderboard-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 id="leaderboard-title" className={styles.title}>{t.leaderboard}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.closeLeaderboard}
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
              aria-pressed={m === activeMode}
            >
              {translations.landing.difficultyOptions[m]}
            </button>
          ))}
        </div>
        <div className={styles.content}>
          {loading && <div className={styles.muted} role="status">{t.leaderboardLoading}</div>}
          {error && <div className={styles.muted} role="status">{t.leaderboardError}</div>}
          {!loading && !error && entries.length === 0 && (
            <div className={styles.muted} role="status">{t.leaderboardEmpty}</div>
          )}
          {!loading && !error && entries.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.player}</th>
                  <th>{t.score}</th>
                  <th>{t.days}</th>
                  <th>{t.date}</th>
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
                      {formatDate(entry.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default LeaderboardModal;
