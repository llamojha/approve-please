import Link from "next/link";
import { useState, useMemo } from "react";
import styles from "../../styles/Screen.module.css";
import { useGameState } from "../../context/GameContext";
import { formatMeterValue, meterColorFromValue } from "../../utils/helpers";
import { Counters, BugKind } from "../../types";
import { useTranslations } from "../../hooks/useTranslations";
import { getSupabaseAnonClient } from "../../utils/supabaseClient";
import {
  computeLeaderboardScore,
  sanitizeDisplayName,
} from "../../utils/leaderboard";
<<<<<<< HEAD
import LeaderboardModal from "../common/LeaderboardModal";
=======
>>>>>>> 0af72a8 (refactor(GameOverScreen): integrate Supabase leaderboard and improve code formatting)

const GameOverScreen = () => {
  const {
    state: {
      currentDay,
      gameOverReason,
      counters,
      meters,
      history,
      prodIncidents,
      difficulty,
    },
    actions: { restartGame },
  } = useGameState();
  const translations = useTranslations();
  const gameOverText = translations.gameOver;
  const counterLabels = translations.shared.counters;
  const meterLabels = translations.shared.meters;
  const incidentsText = translations.incidents;
  const bugKindLabels = translations.shared.bugKinds;
  const severityLabels = translations.shared.severity;
  const [displayName, setDisplayName] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const toAlpha = (color: string, alpha: number) => {
    if (color.startsWith("hsl")) {
      return color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
    }
    return color;
  };
  const meterCardStyle = (value: number) => {
    const base = meterColorFromValue(value);
    return {
      background: `linear-gradient(135deg, ${toAlpha(base, 0.25)}, ${toAlpha(
        base,
        0.1
      )})`,
      borderColor: base,
      color: "#fff",
    };
  };
  const stabilityCardStyle = meterCardStyle(meters.stability);
  const velocityCardStyle = meterCardStyle(meters.velocity);
  const satisfactionCardStyle = meterCardStyle(meters.satisfaction);
  const formatFalsePositiveReason = (actualBugKinds: BugKind[]) => {
    if (actualBugKinds.length === 0) {
      return { label: incidentsText.reasonClean, isClean: true };
    }
    const uniqueKinds = Array.from(new Set(actualBugKinds));
    if (uniqueKinds.length === 1) {
      const [onlyKind] = uniqueKinds;
      return { label: bugKindLabels[onlyKind] ?? onlyKind, isClean: false };
    }
    return { label: incidentsText.reasonMixed, isClean: false };
  };

  const aggregateCounters = history.reduce<Counters>(
    (totals, day) => ({
      bugsToProd: totals.bugsToProd + day.counters.bugsToProd,
      prsApproved: totals.prsApproved + day.counters.prsApproved,
      prsRejected: totals.prsRejected + day.counters.prsRejected,
      truePositives: totals.truePositives + day.counters.truePositives,
      falsePositives: totals.falsePositives + day.counters.falsePositives,
      cleanApprovals: totals.cleanApprovals + day.counters.cleanApprovals,
    }),
    {
      bugsToProd: 0,
      prsApproved: 0,
      prsRejected: 0,
      truePositives: 0,
      falsePositives: 0,
      cleanApprovals: 0,
    }
  );

  const finalCounters: Counters = {
    bugsToProd: aggregateCounters.bugsToProd + counters.bugsToProd,
    prsApproved: aggregateCounters.prsApproved + counters.prsApproved,
    prsRejected: aggregateCounters.prsRejected + counters.prsRejected,
    truePositives: aggregateCounters.truePositives + counters.truePositives,
    falsePositives: aggregateCounters.falsePositives + counters.falsePositives,
    cleanApprovals: aggregateCounters.cleanApprovals + counters.cleanApprovals,
  };

  const reasonCopy = gameOverReason
    ? translations.gameOverReasons[gameOverReason]
    : gameOverText.defaultReason;
  const daysPlayed = history.length + 1;
  const showLeaderboard = difficulty === "normal";

  const finalScore = useMemo(
    () =>
      computeLeaderboardScore({
        cleanApprovals: finalCounters.cleanApprovals,
        truePositives: finalCounters.truePositives,
        daysPlayed,
      }),
    [finalCounters.cleanApprovals, finalCounters.truePositives, daysPlayed]
  );

  const submitToLeaderboard = async () => {
    if (submitStatus === "submitting") return;
    setSubmitStatus("submitting");
    setSubmitError(null);
    try {
      const supabase = getSupabaseAnonClient();
      if (!supabase) {
        throw new Error("Leaderboard is not configured.");
      }
      const { error } = await supabase.from("leaderboard_entries").insert({
        display_name: sanitizeDisplayName(displayName),
        clean_approvals: finalCounters.cleanApprovals,
        true_positives: finalCounters.truePositives,
        days_played: daysPlayed,
        score: finalScore,
      });
      if (error) {
        throw new Error(error.message);
      }
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit score."
      );
    }
  };

  return (
    <main className={styles.screenShell}>
      <section className={styles.screenCard}>
        <span className={styles.gameOverTag}>{gameOverText.tag}</span>
        <h1>{gameOverText.heading(currentDay)}</h1>
        <p>{reasonCopy}</p>
        <div className={`${styles.summaryGrid} ${styles.summaryGridWide}`}>
          <div
            className={`${styles.summaryCard} ${styles.summaryCardApproved}`}
          >
            <small>{counterLabels.prsApproved}</small>
            <h2>{finalCounters.prsApproved}</h2>
          </div>
          <div
            className={`${styles.summaryCard} ${styles.summaryCardRejected}`}
          >
            <small>{counterLabels.prsRejected}</small>
            <h2>{finalCounters.prsRejected}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
            <small>{counterLabels.cleanApprovals}</small>
            <h2>{finalCounters.cleanApprovals}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardBugs}`}>
            <small>{counterLabels.bugsToProd}</small>
            <h2>{finalCounters.bugsToProd}</h2>
          </div>
          <div className={`${styles.summaryCard} ${styles.summaryCardTrue}`}>
            <small>{counterLabels.truePositives}</small>
            <h2>{finalCounters.truePositives}</h2>
          </div>
        </div>
        <div
          className={`${styles.summaryGrid} ${styles.summaryGridWide}`}
          style={{ marginTop: "2rem" }}
        >
          <div
            className={`${styles.summaryCard} ${styles.meterCard}`}
            style={stabilityCardStyle}
          >
            <small>{meterLabels.stability}</small>
            <h2>{formatMeterValue(meters.stability)}%</h2>
          </div>
          <div
            className={`${styles.summaryCard} ${styles.meterCard}`}
            style={velocityCardStyle}
          >
            <small>{meterLabels.velocity}</small>
            <h2>{formatMeterValue(meters.velocity)}%</h2>
          </div>
          <div
            className={`${styles.summaryCard} ${styles.meterCard}`}
            style={satisfactionCardStyle}
          >
            <small>{meterLabels.satisfaction}</small>
            <h2>{formatMeterValue(meters.satisfaction)}%</h2>
          </div>
        </div>
        <div className={styles.screenActions}>
          <button
            type="button"
            className={styles.screenButton}
            onClick={restartGame}
          >
            {gameOverText.restartButton}
          </button>
          <Link
            className={`${styles.screenButton} ${styles.screenButtonSecondary}`}
            href="/"
          >
            {gameOverText.homeButton}
          </Link>
        </div>
        {showLeaderboard && (
          <section className={styles.leaderboardForm}>
            <div>
              <strong>Save this run to the leaderboard</strong>
              <p className="muted">
                Your score: <strong>{finalScore}</strong> (clean approvals +
                true positives + days played × 5)
              </p>
            </div>
            <div className={styles.leaderboardControls}>
              <input
                type="text"
                className={styles.leaderboardInput}
                maxLength={64}
                placeholder="Your name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={
                  submitStatus === "submitting" || submitStatus === "success"
                }
              />
              <button
                type="button"
                className={styles.leaderboardSubmit}
                onClick={submitToLeaderboard}
                disabled={
                  submitStatus === "submitting" || submitStatus === "success"
                }
              >
                {submitStatus === "submitting"
                  ? "Saving…"
                  : submitStatus === "success"
                  ? "Saved"
                  : "Submit score"}
              </button>
              <button
                type="button"
                className={`${styles.screenButton} ${styles.screenButtonSecondary}`}
                onClick={() => setShowLeaderboardModal(true)}
              >
                View leaderboard
              </button>
            </div>
            <div className={styles.leaderboardStatus}>
              {submitStatus === "success" &&
                "Saved! Your run is on the leaderboard."}
              {submitStatus === "error" && submitError}
            </div>
          </section>
        )}
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
        />
        {prodIncidents.length > 0 && (
          <section className={styles.incidentSection}>
            <h3>{gameOverText.deployedHeading}</h3>
            <p className="muted">{gameOverText.deployedBody}</p>
            <ul className={styles.incidentList}>
              {prodIncidents.map((incident, index) => (
                <li
                  key={`${incident.prId}-${incident.bugKind}-${index}`}
                  className={styles.incidentItem}
                >
                  <div className={styles.incidentMeta}>
                    <div>
                      <strong>{incident.title}</strong>
                      <div className={styles.incidentSubline}>
                        {incidentsText.byline(
                          incident.author,
                          bugKindLabels[incident.bugKind] ?? incident.bugKind
                        )}
                      </div>
                    </div>
                    <div className={styles.incidentBadges}>
                      <span className={`${styles.badge} ${styles.badgeReason}`}>
                        {bugKindLabels[incident.bugKind] ?? incident.bugKind}
                      </span>
                      <span
                        className={`${styles.badge} ${
                          styles[
                            `severity${incident.severity
                              .charAt(0)
                              .toUpperCase()}${incident.severity.slice(1)}`
                          ]
                        }`}
                      >
                        {severityLabels[incident.severity] ?? incident.severity}
                      </span>
                    </div>
                  </div>
                  {incident.description && (
                    <p className={styles.incidentNote}>
                      {incident.description}
                    </p>
                  )}
                  {incident.lines.length > 0 && (
                    <ul className={styles.lineList}>
                      {incident.lines.map((line) => (
                        <li key={`${incident.prId}-${line.lineNumber}`}>
                          L{line.lineNumber}: <code>{line.content || "…"}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
};

export default GameOverScreen;
