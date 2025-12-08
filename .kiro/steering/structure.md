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

## PR Template Structure

Each template is a JSON file in `data/prTemplates/<language>/<template-name>/template.json`:

- `templateId`: Unique identifier
- `title`, `author`, `description`, `tags`: PR metadata
- `localized`: Optional translations (es, etc.)
- `importance`: low | normal | high
- `files`: Array of file diffs with line-by-line content
- `bugPatterns`: Array of bugs with kind, lineNumbers, severity

## State Management

Game state flows through `GameContext` using a reducer pattern. Key state:

- `phase`: BRIEFING | WORK | SUMMARY | GAME_OVER
- `meters`: stability, velocity, satisfaction (0-100)
- `queue`: Active PR queue
- `counters`: Daily stats (prsApproved, bugsToProd, etc.)
