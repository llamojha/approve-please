import { useRouter } from 'next/router';
import { useGameState } from '../context/GameContext';
import { LanguagePreference } from '../types';

interface LanguageOption {
  value: LanguagePreference;
  label: string;
  disabled?: boolean;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'any', label: 'Any' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python', disabled: true },
  { value: 'java', label: 'Java', disabled: true },
  { value: 'rust', label: 'Rust', disabled: true }
];

const IndexPage = () => {
  const router = useRouter();

  const {
    state: { currentDay, meters, languagePreference },
    actions: { setLanguagePreference }
  } = useGameState();

  return (
    <main className="landing">
      <section className="landing__card">
        <p className="landing__tag">Desk Sim</p>
        <h1>Approve Please</h1>
        <p className="landing__blurb">
          Step into Release Ops. Review PRs, hold the line on stability, and try not to get fired.
        </p>
        <div className="landing__stats">
          <div>
            <small>Next Day</small>
            <p>Day {currentDay}</p>
          </div>
          <div>
            <small>Stability</small>
            <p>{meters.stability}%</p>
          </div>
          <div>
            <small>Satisfaction</small>
            <p>{meters.satisfaction}%</p>
          </div>
        </div>
        <section className="landing__language">
          <div className="landing__language-header">
            <small>Preferred Language</small>
            <span>Docs & config PRs always appear.</span>
          </div>
          <div className="landing__language-options">
            {LANGUAGE_OPTIONS.map(({ value, label, disabled }) => (
              <button
                type="button"
                key={value}
                className={`${languagePreference === value ? 'active' : ''} ${disabled ? 'disabled' : ''}`.trim()}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  setLanguagePreference(value);
                }}
                disabled={disabled}
              >
                {label}
                {disabled ? ' (soon)' : ''}
              </button>
            ))}
          </div>
        </section>
        <button
          type="button"
          className="landing__cta"
          onClick={() => router.push('/game')}
        >
          <span>Start Your Day</span>
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
      </section>
      <style jsx>{`
        .landing {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 50%), var(--bg);
        }
        .landing__card {
          width: min(520px, 100%);
          background: var(--bg-panel);
          padding: 2.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          box-shadow: 0 20px 50px rgba(2, 6, 23, 0.8);
        }
        h1 {
          margin: 0 0 0.5rem;
          font-size: clamp(2rem, 4vw, 3rem);
        }
        .landing__tag {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }
        .landing__blurb {
          color: var(--muted);
          line-height: 1.6;
        }
        .landing__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }
        .landing__stats small {
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 0.1em;
        }
        .landing__language {
          border: 1px dashed var(--border);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          background: rgba(15, 23, 42, 0.2);
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
          color: var(--muted);
          letter-spacing: 0.1em;
        }
        .landing__language-header span {
          color: var(--muted);
          font-size: 0.85rem;
        }
        .landing__language-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .landing__language-options button {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.9rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .landing__language-options button.active {
          border-color: var(--accent);
          background: rgba(56, 189, 248, 0.15);
        }
        .landing__language-options button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .landing__language-options button.disabled {
          color: var(--muted);
          border-style: dashed;
        }
        .landing__language-options button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
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
          background: linear-gradient(120deg, rgba(56, 189, 248, 0.95), rgba(59, 130, 246, 0.95));
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
        .landing__cta:hover,
        .landing__cta:focus-visible {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(15, 118, 209, 0.45);
        }
        .landing__cta:hover svg,
        .landing__cta:focus-visible svg {
          transform: translateX(3px);
        }
      `}</style>
    </main>
  );
};

export default IndexPage;
