# Project Structure

```
├── pages/              # Next.js pages (entry points)
│   ├── index.tsx       # Landing/title screen
│   ├── game.tsx        # Main game view
│   └── _app.tsx        # App wrapper with providers
│
├── components/         # React components
│   ├── common/         # Shared UI (Panel, HydrationErrorBoundary)
│   ├── screens/        # Full-screen views (Briefing, Work, Summary, GameOver)
│   ├── tutorial/       # Tutorial hints and overlays
│   └── work/           # Game UI components (PRViewer, MeterHud, ActionPanel, etc.)
│
├── context/            # React Context providers
│   ├── GameContext.tsx # Core game state (reducer pattern)
│   ├── LocaleContext.tsx
│   └── UIPreferencesContext.tsx
│
├── hooks/              # Custom React hooks
│   ├── useGameClock.ts # In-game time progression
│   ├── usePRSpawner.ts # PR wave generation
│   ├── useAudioCue.ts
│   └── useTranslations.ts
│
├── types/              # TypeScript type definitions
│   └── index.ts        # All shared types (PullRequest, BugPattern, GamePhase, etc.)
│
├── constants/          # Game configuration
│   ├── game.ts         # Re-exports gameSettings
│   ├── gameSettings.ts # Timing, meters, scoring constants
│   ├── i18n.ts         # Translation strings
│   └── siteMetadata.ts
│
├── data/               # Game content
│   ├── prs.ts          # PR template exports
│   ├── dayMantras.ts   # Daily motivational text
│   ├── dayQuotes.ts    # NPC quotes
│   └── prTemplates/    # PR template JSON files
│       ├── generic/    # Language-agnostic templates
│       ├── typescript/ # TypeScript-specific templates
│       ├── java/       # Java-specific templates
│       ├── python/     # Python-specific templates
│       ├── rust/       # Rust-specific templates
│       └── templateManifest.ts  # Auto-generated (run generate:templates)
│
├── utils/              # Pure utility functions
│   ├── helpers.ts      # General helpers (clamp, formatMeterValue, etc.)
│   ├── pr.ts           # PR instantiation logic
│   └── language.ts     # Language detection for templates
│
├── styles/             # CSS Modules
│   ├── globals.css     # Global styles
│   ├── Desk.module.css # Work screen styles
│   └── Screen.module.css
│
├── scripts/            # Build scripts
│   └── build-template-manifest.mjs  # Generates templateManifest.ts
│
└── public/             # Static assets (images, favicon)
```

## Styling Approach

All component styles use CSS Modules (`*.module.css`). No `<style jsx>` or inline `style={}` for static rules.

Acceptable inline styles: dynamic values computed at runtime (progress bar widths, meter fill percentages, conditional colors derived from game state).

### CSS Migration (In Progress)

`pages/index.tsx` still contains a large `<style jsx>` block (~400 lines) that needs extraction to a dedicated CSS Module (e.g. `styles/Landing.module.css`). A handful of components also use inline `style={}` for static layout rules that belong in CSS Modules:

- `components/screens/GameOverScreen.tsx` — static margin, card styles
- `components/screens/SummaryScreen.tsx` — static margin, card styles
- `components/common/HydrationErrorBoundary.tsx` — fallback layout

Components with only dynamic inline styles (ClockDisplay, MeterBar, QueuePanel) are fine as-is.

## PR Template Structure

Each template is a JSON file in `data/prTemplates/<language>/<template-name>/template.json`:

- `templateId`: Unique identifier
- `title`, `author`, `description`, `tags`: PR metadata
- `localized`: Optional translations (es, etc.)
- `importance`: low | normal | high
- `files`: Array of file diffs with line-by-line content
- `bugPatterns`: Array of bugs with kind, lineNumbers, severity

### Template Loading (Needs Refactor)

Currently, a build script (`scripts/build-template-manifest.mjs`) walks the `data/prTemplates/` directory tree, finds every `template.json`, and generates a `templateManifest.ts` file with a static import per template. This produces a ~57KB generated file and requires running `npm run generate:templates` every time a template is added or removed.

Target approach: templates should be auto-discovered from the filesystem at build time using Next.js `getStaticProps` (or equivalent), eliminating the manifest generation step. Drop a `template.json` into the right language folder and it's picked up automatically — no build script, no manifest file, no hardcoded imports.

## State Management

Game state flows through `GameContext` using a reducer pattern. Key state:

- `phase`: BRIEFING | WORK | SUMMARY | GAME_OVER
- `meters`: stability, velocity, satisfaction (0-100)
- `queue`: Active PR queue
- `counters`: Daily stats (prsApproved, bugsToProd, etc.)
