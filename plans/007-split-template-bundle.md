# Plan 007: Lazy-load PR template packs per language instead of bundling all 400 eagerly

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- scripts/build-template-manifest.mjs data/prTemplates/templateManifest.ts data/prs.ts hooks/usePRSpawner.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED — touches the spawner, which has hard product invariants (see below); measure before/after and honor the STOP conditions
- **Depends on**: plans/001-verification-baseline.md (need the test suite green before/after)
- **Category**: perf
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

`data/prTemplates/` holds ~400 `template.json` files totaling **1.6 MB**, and `data/prTemplates/templateManifest.ts` statically imports every one of them. `data/prs.ts` re-exports the manifest and `hooks/usePRSpawner.ts` imports it at module scope, so the entire content library ships in the first-load JS of `/game` (and transitively `/` via shared chunks) regardless of which languages the player selected. The cost grows linearly with every content addition — and growing content is the project's stated direction (auto-discovered template folders, more languages). Splitting per-language keeps first load flat while preserving the manifest system, which is a hard requirement: `agent.md` Non-Negotiable #3 — "Do not delete or bypass the manifest system; all templates must be included through `data/prTemplates/templateManifest.ts`."

## Current state

- `scripts/build-template-manifest.mjs` — build script (`npm run generate:templates`) that scans `data/prTemplates/*/*/template.json` and writes `templateManifest.ts` as ~787 lines of static imports plus a default-export array. **Read this script fully before editing — it also validates templates; keep the validation.**
- `data/prTemplates/templateManifest.ts` — auto-generated; header comment says so. Never hand-edit; change the generator.
- `data/prs.ts` — 6 lines: re-exports the manifest as `prTemplates` and the `PullRequestTemplate` type.
- `hooks/usePRSpawner.ts` — consumes `prTemplates` in three places: module-scope `templateMap` (line 9, for scripted tutorial waves), the base-pool effect (lines 160–169, filters by language preference into `basePoolRef`), and `drawBatch`/`spawnSpecific`. Spawn invariants from `agent.md`: waves must fire at their minutes; **day 1 must always start with the two scripted tutorial PRs** (`pr-000-onboarding-readme-update`, `pr-001-sanitize-readme-api-key`, both in `data/prTemplates/generic/`); the manifest system stays.
- Language folders at `93d5370`: `css`, `generic`, `java`, `javascript`, `python`, `rust`, `typescript`.
- `utils/language.ts` — `getCodeLanguages(files)` derives languages from file extensions per template; the folder name is NOT authoritative for matching (generic docs templates live in `generic/` but also e.g. YAML-only templates elsewhere match as config). The per-language packs below therefore split by **folder**, and preference filtering still runs per-template afterwards — splitting is a loading optimization, not a filtering change.
- Baseline measurement to take BEFORE changes: `npm run build` and record the `/game` "First Load JS" line Next prints.

## Commands you will need

| Purpose   | Command                     | Expected on success |
|-----------|-----------------------------|---------------------|
| Install   | `npm ci`                    | exit 0              |
| Regenerate| `npm run generate:templates`| exit 0; manifest files rewritten |
| Typecheck | `npm run typecheck`         | exit 0              |
| Tests     | `npm test`                  | all pass            |
| Build     | `npm run build`             | exit 0; note First Load JS per route |

## Scope

**In scope** (the only files you should modify/create):
- `scripts/build-template-manifest.mjs`
- `data/prTemplates/templateManifest.ts` and new generated `data/prTemplates/manifest.<language>.ts` files (generated output — via the script only)
- `data/prs.ts`
- `hooks/usePRSpawner.ts`
- `components/screens/WorkScreen.tsx` (only if a loading gate is needed — see step 3)
- `tests/templateLoader.test.ts` (create)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Any `template.json` content.
- The wave-timing logic, weighted counts, tutorial wave definitions, or hourly safety check in `usePRSpawner.ts` — only *where templates come from* changes, never *when/what spawns*.
- `pages/index.tsx` language selection UI.

## Git workflow

- Branch: `advisor/007-split-template-bundle`
- Conventional commits, e.g. `perf(templates): lazy-load per-language template packs`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Record the baseline

`npm ci && npm run build`; record First Load JS for `/` and `/game` in your final report.

### Step 2: Generate per-language manifests

Modify `scripts/build-template-manifest.mjs` to emit, alongside the existing validation:

- `data/prTemplates/manifest.<language>.ts` per top-level folder (same static-import style, exporting that folder's `PullRequestTemplate[]`),
- `data/prTemplates/templateManifest.ts` rewritten as the aggregator that preserves the old contract **and** adds lazy loaders:

```ts
// Auto-generated — do not edit
import genericTemplates from './manifest.generic';
export const eagerTemplates = genericTemplates;           // tutorial lives here; always loaded
export const templateLoaders: Record<string, () => Promise<PullRequestTemplate[]>> = {
  css: () => import('./manifest.css').then(m => m.default),
  java: () => import('./manifest.java').then(m => m.default),
  // ... one per non-generic folder
};
```

`generic` stays eagerly imported because the day-1 tutorial templates must exist before the first wave at minute 0. Run `npm run generate:templates` to produce the files.

**Verify**: `npm run generate:templates` → exit 0; `ls data/prTemplates/manifest.*.ts` lists one file per language folder; `head -3 data/prTemplates/templateManifest.ts` still says auto-generated.

### Step 3: Async pool loading in the spawner

In `data/prs.ts`, export the new pieces (`eagerTemplates`, `templateLoaders`) — keep exporting a combined synchronous `prTemplates` ONLY if something else still imports it (grep; at `93d5370` only `usePRSpawner.ts` does — remove the combined export if it's the sole consumer, otherwise STOP and report).

In `hooks/usePRSpawner.ts`:
- `templateMap` (scripted waves) builds from `eagerTemplates` — tutorial IDs are generic, so this stays synchronous and day 1 is safe.
- The base-pool effect becomes async: start from `eagerTemplates`, then `Promise.all` the loaders for the selected languages (all loaders when preference is empty, since empty preference means "everything" — see `templateMatchesPreference`), filter with the existing `templateMatchesPreference`, and set `basePoolRef`/`workingPoolRef` when resolved. Guard with a cancellation flag (the effect may re-run when `languagePreference`/`currentDay` changes). If a wave fires before the pool resolves, `drawBatch` already tolerates an empty pool (returns fewer PRs) — but that would violate pacing, so ALSO make the minute-0 default wave re-attempt: simplest correct approach is to keep the already-triggered wave marker OUT of `triggeredWaves` when `drawBatch` returned 0 PRs due to an empty pool (only for the non-scripted path). Keep this change minimal and commented.
- Day 1 is unaffected (scripted wave uses eager templates); the loading window in practice is between "Start work" clicks on later days, which is ample.

**Verify**: `npm run typecheck && npm test` → green. Manual: `npm run dev`, play day 1 (tutorial PRs appear at 9:00 immediately), select only `rust` + `generic` on the landing page and confirm day 2 waves contain rust/generic PRs, with dev-console `[Spawner]` logs showing draws.

### Step 4: Loader test + measure

Create `tests/templateLoader.test.ts`: import `templateLoaders` and assert every language folder present on disk (`fs.readdirSync('data/prTemplates')` filtered to directories, minus `generic`) has a loader key, and that `eagerTemplates` contains both tutorial template IDs (`pr-000-onboarding-readme-update`, `pr-001-sanitize-readme-api-key`). Then `npm run build` and compare First Load JS against step 1.

**Verify**: `npm test` → pass. First Load JS for `/game` dropped materially (expect on the order of hundreds of KB pre-gzip; report exact numbers). If it did NOT drop, a static import path still pulls everything — find it (`npx next build` output + grep for `templateManifest`) before proceeding.

## Test plan

- `tests/templateLoader.test.ts` (step 4).
- Existing suite must stay green untouched.
- Manual pacing check (step 3) — the spawner has no automated tests (see plan 001 maintenance note).

## Done criteria

- [ ] `grep -c "^import tpl_" data/prTemplates/templateManifest.ts` → only generic imports remain (roughly 20, not ~400)
- [ ] `npm run generate:templates` is idempotent (running twice produces no diff: `git diff --exit-code data/prTemplates` after second run)
- [ ] Day-1 tutorial PRs spawn at minute 0 (manual)
- [ ] First Load JS for `/game` measurably lower than the step-1 baseline; numbers reported
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Honoring the "waves must fire on time" invariant requires more than the minimal re-attempt tweak described in step 3 (e.g. restructuring the wave loop) — the pacing system is a product non-negotiable; report the design tension.
- `prTemplates` (the combined sync export) has consumers beyond `usePRSpawner.ts`.
- Bundle size does not drop after step 4's investigation.
- The generator script's validation logic is intertwined with emission in a way that makes per-language output a rewrite rather than an extension.

## Maintenance notes

- New language folders now need: folder + `npm run generate:templates` (loader map is generated, so no hand-wiring) + `utils/language.ts` aliases/labels + landing-page option — same as before plus nothing.
- Reviewer: scrutinize the effect cancellation in the spawner (step 3) — a stale resolve overwriting a newer pool is the likely bug class here.
- Deferred: prefetching selected language packs from the landing page (`import()` on selection) to hide the load entirely; do it later if the loading window ever becomes visible.
