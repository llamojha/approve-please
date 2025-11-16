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
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'rust', label: 'Rust', disabled: true }
];

const IndexPage = () => {
  const router = useRouter();

  const {
    state: { languagePreference },
    actions: { setLanguagePreference }
  } = useGameState();

  return (
    <main className="landing">
      <section className="landing__card">
        <div className="landing__intro">
          <h1>Approve Please</h1>
          <p className="landing__blurb">
            Step into Release Ops. Review PRs, hold the line on stability, and try not to get fired.
          </p>
        </div>
        <section className="landing__primer">
          <div className="landing__primer-header">
            <small>Mission Brief</small>
            <span>Ship fast, stop bugs, and don’t lose leadership’s trust.</span>
          </div>
          <p>
            Every day you triage a queue of PRs from 9–17h. Approve clean diffs to keep features moving, but catch the
            risky ones before they reach prod. Keep all three meters above zero to survive the week.
          </p>
          <dl className="landing__primer-stats">
            <div>
              <dt>Stability</dt>
              <dd>Shows prod health. Drops when buggy PRs sneak through, rises when you block real issues.</dd>
            </div>
            <div>
              <dt>Velocity</dt>
              <dd>Measures throughput. Approvals and quick reviews boost it, but false alarms drag it down.</dd>
            </div>
            <div>
              <dt>Satisfaction</dt>
              <dd>Tracks leadership patience. Smart calls earn grace; needless delays or outages tank morale.</dd>
            </div>
          </dl>
        </section>
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
        <div className="landing__actions">
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
        </div>
      </section>
      <style jsx>{`
        .landing {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          background: radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 50%), var(--bg);
        }
        .landing__card {
          position: relative;
          width: min(720px, 100%);
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(2, 6, 23, 0.8);
          background: url('/social-card-no-title.png') center/cover no-repeat;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
