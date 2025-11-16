# Approve Please – Agent Notes

## Core Loop
- Day flavor is sourced from `data/dayMantras.ts`. Tutorial scripted waves (the opening two PRs) are defined directly inside `hooks/usePRSpawner.ts`; beyond that, every day follows the default wave cadence.
- `hooks/usePRSpawner.ts` orchestrates everything:
  - Builds a shuffle bag from all PR templates (generic + language-specific).
  - Triggers scripted waves exactly at their `atMinute` timestamps.
  - Default waves fire at minutes 0, 60, 180, and 360. Minute 0 always drops exactly 2 PRs; the other three minutes draw counts from `[1, 1, 2, 2, 2, 3, 3, 4, 5]` (favor small bursts). These waves are mandatory unless a scripted wave already occupies that timestamp.
  - Hourly safety check (Day > 1) only adds 1 PR when queue is empty. This is secondary; it must never interfere with scripted/timed waves.
- `data/prTemplates/**/template.json` holds all diff templates. After editing/adding templates run `npm run generate:templates` to regenerate the manifest.

## Tutorial Expectations
- Day 1 starts with two scripted PRs (clean README + exposed API key). Purpose: teach approve vs request changes. Waves still exist later in the day to maintain pacing.
- Tutorial PRs should remain safe/simple; avoid changing their templates unless adjusting onboarding flow.

## Language/Queue Rules
- Generic templates (docs/config) always eligible regardless of preference. Language preference filters additional templates by actual code languages in the files.
- When adding new language folders, update `utils/language.ts` aliases + labels and expose disabled options on the landing page if not ready.

## Styling/UI
- Quotations for each day live in `data/dayQuotes.ts` and display on both briefing + rulebook alongside the mantra pulled from `data/dayMantras.ts`. Keep messaging short (~1 sentence).

## Localization
- All player-facing copy must round-trip through the translation tables in `constants/i18n.ts` and be accessible via `useTranslations()`. When adding new UI strings, wire them into that dictionary instead of hardcoding text.
- Game flavor data (mantras in `data/dayMantras.ts`, quotes in `data/dayQuotes.ts`) stores both EN/ES variants; preserve this shape and provide translations whenever you add or adjust entries.
- New data sources that surface in the UI (e.g., scripted day configs, special events) must be structured like the other bilingual datasets so the homepage language toggle updates them instantly.
- PR templates support localized metadata via an optional `localized` block (per-template) plus optional `localizedDescription` on each bug pattern. Always keep the base English fields as defaults and add translations under the respective locale keys (`en`, `es`, etc.).

## Commands / Tooling
- `npm run dev` to launch Next.js.
- `npm run typecheck`, `npm run lint`, `npm run build` for CI parity.
- `npm run generate:templates` after any template additions/renames.

## Non-Negotiables
1. **Waves are imperative.** Never remove them and ensure they fire before any fallback spawns.
2. Day 1 must always start with the two scripted tutorial PRs; no other PRs should arrive before those are processed.
3. Do not delete or bypass the manifest system; all templates must be included through `data/prTemplates/templateManifest.ts`.
4. Maintain dev-only logging in the spawner to help diagnose spawn order (guarded by `NODE_ENV !== 'production'`).
5. Markdown fenced code in PR templates must use two-space indentation inside the fence for consistent rendering.
6. All TypeScript PR templates have been normalized to two-space indentation (function scopes, JSX, YAML blocks, etc.); new or edited templates must preserve that structure.
7. When adjusting indentation across PR templates, split the work into small batches to avoid mistakes; never run bulk auto-formatting across every template at once.

Use this document as guidance when updating the game loop so future changes respect the pacing and tutorial requirements.
