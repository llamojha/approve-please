import { useRouter } from "next/router";
import { useGameState } from "../context/GameContext";
import { useLocale } from "../context/LocaleContext";
import { useTranslations } from "../hooks/useTranslations";
import { LOCALE_OPTIONS } from "../constants/i18n";
import { useState, useMemo, useCallback } from "react";
import LeaderboardModal from "../components/common/LeaderboardModal";
import styles from "../styles/Landing.module.css";

interface LanguageOption {
  value: string;
  disabled?: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "generic" },
  { value: "typescript" },
  { value: "javascript" },
  { value: "python" },
  { value: "java" },
  { value: "rust" },
  { value: "css" },
];

const DIFFICULTY_OPTIONS = ["normal", "learning"] as const;

const imageSrcs = [
  "/tutorial-slide-1-placeholder.png",
  "/tutorial-slide-2-placeholder.png",
  "/tutorial-slide-3-placeholder.png",
  "/tutorial-slide-4-placeholder.png",
  "/tutorial-slide-5-placeholder.png",
  "/tutorial-slide-6-placeholder.png",
];

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
    () =>
      landing.tutorialSlides?.map((slide, idx) => ({
        ...slide,
        imageSrc: imageSrcs[idx] ?? "",
      })) ?? [],
    [landing.tutorialSlides]
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
    <main className={styles.landing}>
      <div
        className={styles.localeToggle}
        role="group"
        aria-label={translations.localeToggleLabel}
      >
        {LOCALE_OPTIONS.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            className={locale === value ? styles.active : ""}
            aria-pressed={locale === value}
            onClick={() => setLocale(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <section className={styles.card}>
        <div className={styles.intro}>
          <h1>{landing.title}</h1>
          <p className={styles.blurb}>{landing.blurb}</p>
        </div>
        <section className={styles.primer}>
          <div className={styles.primerHeader}>
            <small>{landing.missionHeading}</small>
            <span>{landing.missionTagline}</span>
          </div>
          <p>{landing.primer}</p>
          <dl className={styles.primerStats}>
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
        <section className={styles.language}>
          <div className={styles.languageHeader}>
            <small>{landing.languageHeader}</small>
            <span>{languagePreference.length} selected</span>
          </div>
          <p className={styles.languageHint}>
            PRs will include code from selected languages
          </p>
          <div className={styles.languageOptions}>
            {LANGUAGE_OPTIONS.map(({ value, disabled }) => {
              const isSelected = languagePreference.includes(value);
              const isLastSelected =
                languagePreference.length === 1 && isSelected;
              return (
                <button
                  type="button"
                  key={value}
                  className={`${isSelected ? styles.active : ""} ${
                    disabled ? styles.disabled : ""
                  }`.trim()}
                  onClick={() => {
                    if (disabled || isLastSelected) return;
                    if (isSelected) {
                      setLanguagePreference(
                        languagePreference.filter((p) => p !== value)
                      );
                    } else {
                      setLanguagePreference([...languagePreference, value]);
                    }
                  }}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  title={
                    isLastSelected
                      ? "At least one language required"
                      : undefined
                  }
                >
                  {languagePreferenceLabels[value] ?? value}
                  {disabled ? ` ${landing.comingSoon}` : ""}
                </button>
              );
            })}
          </div>
        </section>
        <section className={styles.difficulty}>
          <div className={styles.difficultyHeader}>
            <small>{landing.difficultyHeader}</small>
            <span>{landing.difficultySubtitle}</span>
          </div>
          <div className={styles.difficultyOptions}>
            {DIFFICULTY_OPTIONS.map((value) => (
              <button
                type="button"
                key={value}
                className={difficulty === value ? styles.active : ""}
                onClick={() => setDifficulty(value)}
              >
                {landing.difficultyOptions?.[value] ?? value}
              </button>
            ))}
          </div>
        </section>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setSlideIndex(0);
              setTutorialOpen(true);
            }}
          >
            {landing.tutorialCta}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setLeaderboardOpen(true)}
          >
            🏆 Leaderboard
          </button>
          <button
            type="button"
            className={styles.cta}
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
          className={styles.tutorial}
          role="dialog"
          aria-modal="true"
          aria-label="How to play"
        >
          <div className={styles.tutorialBackdrop} onClick={closeTutorial} />
          <div className={styles.tutorialContent}>
            <button
              type="button"
              className={styles.tutorialClose}
              onClick={closeTutorial}
              aria-label="Close tutorial"
            >
              ×
            </button>
            <div className={styles.tutorialBody}>
              <div className={styles.tutorialImage}>
                {tutorialSlides[slideIndex].imageSrc ? (
                  <img
                    className={styles.tutorialImageImg}
                    src={tutorialSlides[slideIndex].imageSrc}
                    alt={tutorialSlides[slideIndex].imageAlt}
                  />
                ) : (
                  <div className={styles.tutorialImagePlaceholder}>
                    <span>{tutorialSlides[slideIndex].imageAlt}</span>
                    <small>Replace with screenshot</small>
                  </div>
                )}
              </div>
              <div className={styles.tutorialText}>
                <p className={styles.tutorialEyebrow}>
                  {landing.tutorialNav?.slideOf(
                    slideIndex + 1,
                    tutorialSlides.length
                  )}
                </p>
                <h3>{tutorialSlides[slideIndex].title}</h3>
                <ul>
                  {tutorialSlides[slideIndex].description.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.tutorialControls}>
              <button
                type="button"
                onClick={prevSlide}
                className={styles.tutorialNav}
              >
                {landing.tutorialNav?.prev}
              </button>
              <div className={styles.tutorialDots} aria-hidden="true">
                {tutorialSlides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.tutorialDot} ${
                      idx === slideIndex ? styles.active : ""
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextSlide}
                className={styles.tutorialNav}
              >
                {landing.tutorialNav?.next}
              </button>
            </div>
          </div>
        </div>
      )}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        mode={difficulty}
      />
    </main>
  );
};

export default IndexPage;
