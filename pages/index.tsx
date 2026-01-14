import { useRouter } from "next/router";
import { useGameState } from "../context/GameContext";
import { useLocale } from "../context/LocaleContext";
import { useTranslations } from "../hooks/useTranslations";
import { LOCALE_OPTIONS } from "../constants/i18n";
import { useState, useMemo, useCallback } from "react";
import LeaderboardModal from "../components/common/LeaderboardModal";

interface LanguageOption {
  value: string;
  disabled?: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "generic" },
  { value: "typescript" },
  { value: "python" },
  { value: "java" },
  { value: "rust" },
  { value: "css" },
];

const DIFFICULTY_OPTIONS = ["normal", "learning"] as const;

const IndexPage = () => {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const translations = useTranslations();
  const landing = translations.landing;
  const languagePreferenceLabels = landing.languageOptions;

  const {
    state: { languagePreference, difficulty },
    actions: { setLanguagePreference, setDifficulty },
  } = useGameState();

  const tutorialSlides = useMemo(
    () => [
      {
        title: "Pick a PR",
        description: [
          "Queue on the left; click to load a PR into the diff.",
          "Rulebook guides what to watch for.",
        ],
        imageAlt: "Queue and PR selection",
        imageSrc: "/tutorial-slide-1-placeholder.png",
      },
      {
        title: "Inspect the Diff",
        description: [
          "Scroll the snippet; tag lines by clicking line numbers.",
          "Use rulebook hints to spot risky code.",
        ],
        imageAlt: "Diff view with selected line",
        imageSrc: "/tutorial-slide-2-placeholder.png",
      },
      {
        title: "Approve vs Request Changes",
        description: [
          "Approve when clean; request changes for risky diffs.",
          "Tag the exact line for a satisfaction bonus.",
        ],
        imageAlt: "Action buttons for approve and request changes",
        imageSrc: "/tutorial-slide-3-placeholder.png",
      },
      {
        title: "Meters & Consequences",
        description: [
          "Stability drops if bugs ship; velocity slows on rejects.",
          "Good catches and clean approvals boost satisfaction.",
        ],
        imageAlt: "Meter HUD showing stability, velocity, satisfaction",
        imageSrc: "/tutorial-slide-4-placeholder.png",
      },
      {
        title: "Day Wrap",
        description: [
          "End-of-day summary shows incidents and false positives.",
          "Advance to the next day or restart if meters tank.",
        ],
        imageAlt: "Summary screen after a workday",
        imageSrc: "/tutorial-slide-5-placeholder.png",
      },
      {
        title: "Learn from Mistakes",
        description: [
          "Review Deployed Bugs at day end to see what slipped.",
          "Study the culprit lines to avoid repeating them.",
        ],
        imageAlt: "Deployed Bugs section highlighting shipped issues",
        imageSrc: "/tutorial-slide-6-placeholder.png",
      },
    ],
    []
  );

  const [isTutorialOpen, setTutorialOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);

  const closeTutorial = useCallback(() => setTutorialOpen(false), []);
  const nextSlide = useCallback(
    () => setSlideIndex((prev) => (prev + 1) % tutorialSlides.length),
    [tutorialSlides.length]
  );
  const prevSlide = useCallback(
    () =>
      setSlideIndex(
        (prev) => (prev - 1 + tutorialSlides.length) % tutorialSlides.length
      ),
    [tutorialSlides.length]
  );

  return (
    <main className="landing">
      <div
        className="landing__locale-toggle"
        role="group"
        aria-label={translations.localeToggleLabel}
      >
        {LOCALE_OPTIONS.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            className={locale === value ? "active" : ""}
            aria-pressed={locale === value}
            onClick={() => setLocale(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="landing__card">
        <div className="landing__intro">
          <h1>{landing.title}</h1>
          <p className="landing__blurb">{landing.blurb}</p>
        </div>
        <section className="landing__primer">
          <div className="landing__primer-header">
            <small>{landing.missionHeading}</small>
            <span>{landing.missionTagline}</span>
          </div>
          <p>{landing.primer}</p>
          <dl className="landing__primer-stats">
            <div>
              <dt>{landing.stats.stability.title}</dt>
              <dd>{landing.stats.stability.description}</dd>
            </div>
            <div>
              <dt>{landing.stats.velocity.title}</dt>
              <dd>{landing.stats.velocity.description}</dd>
            </div>
            <div>
              <dt>{landing.stats.satisfaction.title}</dt>
              <dd>{landing.stats.satisfaction.description}</dd>
            </div>
          </dl>
        </section>
        <section className="landing__language">
          <div className="landing__language-header">
            <small>{landing.languageHeader}</small>
            <span>{languagePreference.length} selected</span>
          </div>
          <p className="landing__language-hint">PRs will include code from selected languages</p>
          <div className="landing__language-options">
            {LANGUAGE_OPTIONS.map(({ value, disabled }) => {
              const isSelected = languagePreference.includes(value);
              const isLastSelected = languagePreference.length === 1 && isSelected;
              return (
                <button
                  type="button"
                  key={value}
                  className={`${isSelected ? "active" : ""} ${disabled ? "disabled" : ""}`.trim()}
                  onClick={() => {
                    if (disabled || isLastSelected) return;
                    if (isSelected) {
                      setLanguagePreference(languagePreference.filter((p) => p !== value));
                    } else {
                      setLanguagePreference([...languagePreference, value]);
                    }
                  }}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  title={isLastSelected ? "At least one language required" : undefined}
                >
                  {languagePreferenceLabels[value] ?? value}
                  {disabled ? ` ${landing.comingSoon}` : ""}
                </button>
              );
            })}
          </div>
        </section>
        <section className="landing__difficulty">
          <div className="landing__difficulty-header">
            <small>{landing.difficultyHeader}</small>
            <span>{landing.difficultySubtitle}</span>
          </div>
          <div className="landing__difficulty-options">
            {DIFFICULTY_OPTIONS.map((value) => (
              <button
                type="button"
                key={value}
                className={`${
                  languagePreference.includes(value) ? "active" : ""
                } ${disabled ? "disabled" : ""}`.trim()}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  if (
                    languagePreference.length === 1 &&
                    languagePreference[0] === value
                  ) {
                    return;
                  }
                  if (languagePreference.includes(value)) {
                    setLanguagePreference(
                      languagePreference.filter(
                        (preference) => preference !== value
                      )
                    );
                  } else {
                    setLanguagePreference([...languagePreference, value]);
                  }
                }}
                disabled={disabled}
              >
                {languagePreferenceLabels[value] ?? value}
                {disabled ? ` ${landing.comingSoon}` : ""}
              </button>
            ))}
          </div>
        </section>
        <section className="landing__difficulty">
          <div className="landing__difficulty-header">
            <small>{landing.difficultyHeader}</small>
            <span>{landing.difficultySubtitle}</span>
          </div>
          <div className="landing__difficulty-options">
            {DIFFICULTY_OPTIONS.map((value) => (
              <button
                type="button"
                key={value}
                className={difficulty === value ? "active" : ""}
                onClick={() => setDifficulty(value)}
              >
                {landing.difficultyOptions[value] ?? value}
              </button>
            ))}
          </div>
        </section>
        <div className="landing__actions">
          <button
            type="button"
            className="landing__secondary"
            onClick={() => {
              setSlideIndex(0);
              setTutorialOpen(true);
            }}
          >
            {landing.tutorialCta}
          </button>
          <button
            type="button"
            className="landing__secondary"
            onClick={() => setLeaderboardOpen(true)}
          >
            🏆 Leaderboard
          </button>
          <button
            type="button"
            className="landing__cta"
            onClick={() => router.push("./game")}
          >
            <span>{landing.startCta}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M5 10h10M11 6l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>
      {isTutorialOpen && (
        <div
          className="tutorial"
          role="dialog"
          aria-modal="true"
          aria-label="How to play"
        >
          <div className="tutorial__backdrop" onClick={closeTutorial} />
          <div className="tutorial__content">
            <button
              type="button"
              className="tutorial__close"
              onClick={closeTutorial}
              aria-label="Close tutorial"
            >
              ×
            </button>
            <div className="tutorial__body">
              <div className="tutorial__image">
                {tutorialSlides[slideIndex].imageSrc ? (
                  <img
                    className="tutorial__image-img"
                    src={tutorialSlides[slideIndex].imageSrc}
                    alt={tutorialSlides[slideIndex].imageAlt}
                  />
                ) : (
                  <div className="tutorial__image-placeholder">
                    <span>{tutorialSlides[slideIndex].imageAlt}</span>
                    <small>Replace with screenshot</small>
                  </div>
                )}
              </div>
              <div className="tutorial__text">
                <p className="tutorial__eyebrow">
                  Slide {slideIndex + 1} of {tutorialSlides.length}
                </p>
                <h3>{tutorialSlides[slideIndex].title}</h3>
                <ul>
                  {tutorialSlides[slideIndex].description.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="tutorial__controls">
              <button
                type="button"
                onClick={prevSlide}
                className="tutorial__nav"
              >
                ← Prev
              </button>
              <div className="tutorial__dots" aria-hidden="true">
                {tutorialSlides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`tutorial__dot ${
                      idx === slideIndex ? "active" : ""
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextSlide}
                className="tutorial__nav"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
      <style jsx>{`
        .landing {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          background: radial-gradient(
              circle at top,
              rgba(56, 189, 248, 0.15),
              transparent 50%
            ),
            var(--bg);
          position: relative;
        }
        .landing::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(56, 191, 248, 0.54) 1px,
            transparent 0
          );
          background-size: 24px 24px;
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }
        .landing__card {
          position: relative;
          width: min(720px, 100%);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(2, 6, 23, 0.8);
          background: url("social-card-no-title.png") center/cover no-repeat;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .landing__locale-toggle {
          position: fixed;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.25rem;
          padding: 0.25rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(4, 10, 21, 0.75);
          box-shadow: 0 10px 30px rgba(2, 6, 23, 0.45);
          backdrop-filter: blur(8px);
          z-index: 10;
        }
        .landing__locale-toggle button {
          border: none;
          background: transparent;
          color: #e2e8f0;
          font-weight: 600;
          letter-spacing: 0.12em;
          font-size: 0.75rem;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .landing__locale-toggle button.active {
          background: rgba(56, 189, 248, 0.85);
          color: #04111f;
        }
        .landing__locale-toggle button:hover:not(.active),
        .landing__locale-toggle button:focus-visible:not(.active) {
          background: rgba(255, 255, 255, 0.08);
        }
        .landing__locale-toggle button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .landing__intro {
          background: rgba(6, 12, 29, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(6px);
        }
        h1 {
          margin: 0 0 0.5rem;
          font-size: clamp(2rem, 4vw, 3rem);
          text-align: center;
        }
        .landing__blurb {
          color: #e2e8f0;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 0;
        }
        .landing__primer {
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: rgba(4, 10, 21, 0.55);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(5px);
        }
        .landing__primer-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.6rem;
        }
        .landing__primer-header small {
          text-transform: uppercase;
          color: #f1f5f9;
          letter-spacing: 0.12em;
        }
        .landing__primer-header span {
          color: #cbd5f5;
          font-size: 0.85rem;
        }
        .landing__primer p {
          margin: 0 0 0.9rem;
          color: #cbd5f5;
          line-height: 1.5;
        }
        .landing__primer-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
          margin: 0;
        }
        .landing__primer-stats div {
          background: rgba(6, 12, 29, 0.45);
          border-radius: 0.5rem;
          padding: 0.75rem;
          border: 1px dashed rgba(148, 163, 184, 0.4);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
        }
        .landing__primer-stats dt {
          font-weight: 600;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.85rem;
          color: #f8fafc;
        }
        .landing__primer-stats dd {
          margin: 0;
          font-size: 0.85rem;
          color: #cbd5f5;
          line-height: 1.4;
        }
        .landing__language {
          border: 1px dashed rgba(148, 163, 184, 0.35);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(4, 10, 21, 0.5);
          backdrop-filter: blur(4px);
        }
        .landing__language-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .landing__language-header small {
          text-transform: uppercase;
          color: #f1f5f9;
          letter-spacing: 0.1em;
        }
        .landing__language-header span {
          color: #cbd5f5;
          font-size: 0.85rem;
        }
        .landing__language-hint {
          margin: 0 0 0.75rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .landing__language-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .landing__language-options button {
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.9rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .landing__language-options button:hover:not(.active):not(:disabled),
        .landing__language-options
          button:focus-visible:not(.active):not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(148, 163, 184, 0.7);
        }
        .landing__language-options button.active {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.2);
        }
        .landing__language-options button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .landing__language-options button.disabled {
          color: rgba(226, 232, 240, 0.5);
          border-style: dashed;
        }
        .landing__language-options button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .landing__difficulty {
          border: 1px dashed rgba(148, 163, 184, 0.35);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(4, 10, 21, 0.5);
          backdrop-filter: blur(4px);
        }
        .landing__difficulty-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .landing__difficulty-header small {
          text-transform: uppercase;
          color: #f1f5f9;
          letter-spacing: 0.1em;
        }
        .landing__difficulty-header span {
          color: #cbd5f5;
          font-size: 0.85rem;
        }
        .landing__difficulty-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .landing__difficulty-options button {
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.9rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .landing__difficulty-options button:hover:not(.active),
        .landing__difficulty-options button:focus-visible:not(.active) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(148, 163, 184, 0.7);
        }
        .landing__difficulty-options button.active {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.2);
        }
        .landing__difficulty-options button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .landing__actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(4, 10, 21, 0.45);
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
        }
        .landing__secondary {
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          color: #f8fafc;
          padding: 0.85rem 1.2rem;
          border-radius: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .landing__secondary:hover,
        .landing__secondary:focus-visible {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.24);
          transform: translateY(-1px);
        }
        .landing__cta {
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 0.85rem;
          background: linear-gradient(
            120deg,
            rgba(46, 164, 223, 0.95),
            rgba(41, 121, 202, 0.95)
          );
          color: #04111f;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(15, 118, 209, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }
        .landing__cta span {
          display: inline-flex;
          align-items: center;
        }
        .landing__cta svg {
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .landing__cta:hover {
          transform: translateY(-2px);
          background: linear-gradient(
            120deg,
            rgba(125, 211, 252, 1),
            rgba(147, 197, 253, 1)
          );
        }
        .landing__cta:focus-visible {
          transform: translateY(-2px);
          background: rgba(125, 211, 252, 1);
          outline: 2px solid rgba(125, 211, 252, 0.6);
          outline-offset: 2px;
        }
        .landing__cta:hover svg,
        .landing__cta:focus-visible svg {
          transform: translateX(3px);
        }
        .tutorial {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .tutorial__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(4, 10, 21, 0.7);
          backdrop-filter: blur(4px);
        }
        .tutorial__content {
          position: relative;
          width: min(900px, 100%);
          background: rgba(10, 14, 24, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.3);
          box-shadow: 0 25px 60px rgba(2, 6, 23, 0.7);
          border-radius: 1rem;
          padding: 1rem 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 1;
        }
        .tutorial__close {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          border: none;
          background: transparent;
          color: #e2e8f0;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .tutorial__body {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1rem;
          align-items: center;
        }
        .tutorial__image {
          background: rgba(4, 10, 21, 0.6);
          border: 1px dashed rgba(148, 163, 184, 0.35);
          border-radius: 0.75rem;
          padding: 0.75rem;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tutorial__image-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 0.5rem;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .tutorial__image-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          background: repeating-linear-gradient(
              -45deg,
              rgba(148, 163, 184, 0.12),
              rgba(148, 163, 184, 0.12) 10px,
              rgba(148, 163, 184, 0.08) 10px,
              rgba(148, 163, 184, 0.08) 20px
            ),
            rgba(15, 23, 42, 0.7);
          color: #cbd5f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.5rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .tutorial__image-placeholder small {
          color: #94a3b8;
          margin-top: 0.35rem;
          letter-spacing: 0.03em;
        }
        .tutorial__text h3 {
          margin: 0.1rem 0 0.5rem;
          font-size: 1.4rem;
        }
        .tutorial__text ul {
          padding-left: 1.1rem;
          margin: 0.25rem 0 0;
          color: #cbd5f5;
          line-height: 1.5;
        }
        .tutorial__text li {
          margin-bottom: 0.35rem;
        }
        .tutorial__eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          font-size: 0.75rem;
        }
        .tutorial__controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .tutorial__nav {
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(4, 10, 21, 0.6);
          color: #f8fafc;
          padding: 0.5rem 0.9rem;
          border-radius: 0.65rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .tutorial__nav:hover,
        .tutorial__nav:focus-visible {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.12);
        }
        .tutorial__dots {
          display: flex;
          gap: 0.35rem;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .tutorial__dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.5);
        }
        .tutorial__dot.active {
          background: var(--accent);
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
        }
        @media (max-width: 800px) {
          .tutorial__body {
            grid-template-columns: 1fr;
          }
          .tutorial__image {
            min-height: 220px;
          }
          .tutorial__controls {
            flex-direction: column;
          }
          .tutorial__nav {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
};

export default IndexPage;
