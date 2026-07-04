# Plan 006: Deduplicate the summary/game-over screens and the leaderboard client code

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- components/screens/SummaryScreen.tsx components/screens/GameOverScreen.tsx pages/leaderboard.tsx components/common/LeaderboardModal.tsx utils/`
> Plans 003 and 005 intentionally touch these files first — reconcile with
> their landed changes; the excerpts below describe commit `93d5370` and note
> what each prior plan changes. If neither 003 nor 005 has landed, STOP:
> execute them first (this plan assumes their output).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (pure refactor; behavior must not change)
- **Depends on**: plans/003-leaderboard-hardening.md, plans/005-false-positive-feature.md
- **Category**: tech-debt
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

Three clusters of copy-paste have already diverged: (1) `SummaryScreen` and `GameOverScreen` duplicate `toAlpha`, `meterCardStyle`, the three meter cards, and the five counter cards nearly line-for-line; (2) the leaderboard fetch + row mapping existed in three places (page, modal, API route) — after plan 003 the two client call sites both call `/api/leaderboard` but still duplicate the fetch-effect and entry typing; (3) `formatFalsePositiveReason` is defined identically in both screens (plan 005 gives the SummaryScreen copy a caller; the GameOverScreen copy is still dead). Divergence is already observable (page fetches 100 entries, modal 50 — that one is intentional; the mapping around it is not). Consolidating now keeps plans 007+ and future content work from tripling every change.

## Current state

(As of `93d5370`, with notes on what plans 003/005 changed.)

- `components/screens/SummaryScreen.tsx:19–45` and `components/screens/GameOverScreen.tsx:42–72` — identical `toAlpha` + `meterCardStyle` + three meter-card `<div>`s (`styles.meterCard` with inline gradient style); identical five counter cards (`summaryCard` variants for prsApproved/prsRejected/cleanApprovals/bugsToProd/truePositives). Both files import from `styles/Screen.module.css`.
- `formatFalsePositiveReason` — `SummaryScreen.tsx:36` (used after plan 005) and `GameOverScreen.tsx:62` (dead).
- `pages/leaderboard.tsx` and `components/common/LeaderboardModal.tsx` — each declares its own `LeaderboardEntry` type, `formatDate` helper, and a `useEffect` + `alive` flag fetch. After plan 003 both call `fetch('/api/leaderboard?mode=...')` and plan 003 added a shared `LeaderboardEntryDto` in `utils/leaderboard.ts`.
- `utils/supabaseClient.ts` — after plan 003, `getSupabaseAnonClient` has no callers (verify before removing).
- Conventions: components in `components/common/` (see `Panel.tsx` for the minimal shape), default exports, typed props interfaces, CSS Modules. Hooks live in `hooks/` with `use` prefix.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0              |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | all pass            |
| Lint      | `npm run lint`      | exit 0              |
| Build     | `npm run build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create/delete):
- `components/common/RunStatsCards.tsx` (create — counter cards + meter cards)
- `hooks/useLeaderboardEntries.ts` (create — shared fetch hook)
- `utils/falsePositives.ts` (create — shared `formatFalsePositiveReason`) — note it needs the translations object passed in, since it reads locale strings
- `components/screens/SummaryScreen.tsx`, `components/screens/GameOverScreen.tsx` (consume shared pieces; delete local copies)
- `pages/leaderboard.tsx`, `components/common/LeaderboardModal.tsx` (consume the hook; delete local copies)
- `utils/supabaseClient.ts` (remove `getSupabaseAnonClient` **only if** `grep -rn "getSupabaseAnonClient" --include='*.ts*' .` shows no callers outside this file)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Any visual/behavioral change: same markup, same class names, same fetch limits (page 100, modal 50 — pass limit as a hook argument).
- `pages/api/leaderboard.ts` (plan 003's domain).
- Adding a false-positive section to GameOverScreen — tempting while you're in there, but it's a game-design decision flagged in plan 005's maintenance notes. Only delete the dead helper.

## Git workflow

- Branch: `advisor/006-dedupe-screens-leaderboard`
- Conventional commits, e.g. `refactor(screens): extract shared RunStatsCards`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract `RunStatsCards`

Create `components/common/RunStatsCards.tsx` exporting a component that takes `{ counters: Counters; meters: MeterSet }` (import types from `types/index.ts`; labels come from `useTranslations()` inside the component, matching how both screens already do it) and renders exactly the counter-card grid + meter-card grid markup currently duplicated (including `toAlpha`/`meterCardStyle` as module-level helpers in this file). Import `styles/Screen.module.css` — same classes. Replace the duplicated blocks in both screens with `<RunStatsCards counters={...} meters={...} />` — SummaryScreen passes day counters, GameOverScreen passes its aggregated `finalCounters`.

**Verify**: `npm run typecheck && npm run lint` → exit 0. Manual: `npm run dev` — summary and game-over screens look unchanged (compare against a screenshot taken before the change).

### Step 2: Extract `useLeaderboardEntries`

Create `hooks/useLeaderboardEntries.ts`: `useLeaderboardEntries(mode: Difficulty, options?: { limit?: number; enabled?: boolean })` returning `{ entries, loading, error }`, implemented with the same `useEffect` + `alive`-flag pattern the two call sites use today, fetching `/api/leaderboard?mode=...`. `enabled: false` covers the modal's `isOpen` gating. Move the shared `formatDate` into the hook file or a small export alongside — the page's variant shows hour/minute, the modal's doesn't; keep both by passing `Intl.DateTimeFormat` options or leaving `formatDate` per-file (acceptable; the fetch logic is the real duplication). Update both call sites; delete their local types in favor of plan 003's `LeaderboardEntryDto`.

**Verify**: `npm run typecheck` → exit 0. Manual: leaderboard page and modal both load entries and switch modes.

### Step 3: Single `formatFalsePositiveReason` + dead-code sweep

Move the helper to `utils/falsePositives.ts` with signature `(actualBugKinds: BugKind[], incidentsText, bugKindLabels)` (pass the translation slices as arguments — utils must stay hook-free). SummaryScreen imports it; delete both inline copies (GameOverScreen's was dead). Then, if `getSupabaseAnonClient` has no remaining callers (grep per Scope), remove it from `utils/supabaseClient.ts`.

**Verify**: `grep -rn "formatFalsePositiveReason" components utils` → one definition in `utils/falsePositives.ts`, one import site. `npm run typecheck && npm test && npm run build` → exit 0.

## Test plan

No new behavior → no new tests required; the gate is that all plan-001/003/005 tests still pass unchanged (`npm test`). If any test needed editing, the refactor changed behavior — that's a STOP.

## Done criteria

- [ ] `grep -c "toAlpha" components/screens/SummaryScreen.tsx components/screens/GameOverScreen.tsx` → 0 in both
- [ ] `grep -rn "from(\"leaderboard_entries\")\|leaderboard_entries" pages components` → no client-side matches
- [ ] Exactly one `formatFalsePositiveReason` definition repo-wide
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0 with **no test modifications**
- [ ] Screens visually unchanged (manual spot check)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 003 or 005 have not landed (see drift check) — order matters here.
- The two screens' "duplicated" blocks turn out to differ semantically somewhere the excerpts didn't note (e.g. different card order or an extra card) — reconcile intent first, don't silently pick one.
- Any existing test requires modification to pass.

## Maintenance notes

- Future screens (e.g. a weekly recap) should consume `RunStatsCards` and `useLeaderboardEntries` rather than re-copying.
- Reviewer: this diff should be net-negative in lines; if it isn't, the extraction went wrong.
- Deferred: unifying the two `formatDate` variants; showing false positives on GameOverScreen (design call).
