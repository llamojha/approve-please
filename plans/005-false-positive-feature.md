# Plan 005: Finish the false-positive tracking feature (wire counter, records, and status)

> **Amendment (2026-07-09)**: execution correctly STOPped on STOP condition #1 —
> `FalsePositiveRecord.claimedKind: BugKind` (types/index.ts:57) is required but
> unpopulatable: `RequestChangesPayload` carries only `selectedLines`, no kind
> picker exists anywhere, and `claimedKind` has zero producers/consumers
> (verified: the type definition is its only occurrence repo-wide). Resolution:
> **remove the `claimedKind` field from `FalsePositiveRecord`** — a dead field
> from an earlier design. `types/index.ts` is added to the in-scope list for
> that single deletion only. All other fields are populatable as planned.

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- context/GameContext.tsx constants/gameSettings.ts components/screens/SummaryScreen.tsx components/screens/GameOverScreen.tsx types/index.ts constants/i18n.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (additive wiring of existing scaffolding; no balance change)
- **Depends on**: plans/001-verification-baseline.md (extends its reducer tests); run BEFORE plan 006 (006 moves shared helpers this plan starts using)
- **Category**: bug / tech-debt
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

False-positive tracking (rejecting a PR that was actually clean, or tagging the wrong lines) was designed but never finished. The scaffolding is everywhere and all of it is dead: the reducer action `LOG_FALSE_POSITIVE` and state array `falsePositiveRecords` are never dispatched or read; the counter `falsePositives` can never increment because `REQUEST_CHANGES_EFFECTS.missCounters` is `{}`; a helper `formatFalsePositiveReason` is defined-but-unused in **two** screens; and the reject-miss path returns the misleading `status: 'approved'` while the `DecisionResult` union's `'false-positive'` member is never produced. Beyond dead code, this is a game-design hole the product doc cares about ("Correct rejections vs false positives" is a designed end-of-day stat in README §3): wrongly rejecting clean work currently has no visible consequence. This plan wires the existing design end-to-end without changing meter balance.

## Current state

- `context/GameContext.tsx`:
  - `requestChanges` (lines 384–422): hit path dispatches `APPLY_DECISION` with `hitCounters`/`hitMeters` and returns `status: 'true-positive'`. Miss path (lines 411–419) applies `missCounters`/`missMeters` (both **empty** in settings) and returns `{ success: true, status: 'approved', message: decisionCopy.requestNoBonus, bonusApplied: false }` — the `'approved'` here is the wrong status label.
  - `LOG_FALSE_POSITIVE` reducer case (lines 298–300) appends to `state.falsePositiveRecords`; **no dispatcher exists**.
  - `extractLineExcerpts(files, lineNumbers)` (line 181) — reusable for building the record's line excerpts.
  - `RESET_FOR_DAY` already clears `falsePositiveRecords` (line 270).
- `constants/gameSettings.ts` — `requestChanges: { ..., missCounters: {}, missMeters: {} }`.
- `types/index.ts` — `FalsePositiveRecord` type exists (check its exact fields before use); `Counters.falsePositives` exists.
- `components/screens/SummaryScreen.tsx:36` and `components/screens/GameOverScreen.tsx:62` — identical unused `formatFalsePositiveReason(actualBugKinds)` helpers returning `{ label, isClean }` from `incidentsText.reasonClean` / `bugKindLabels` / `incidentsText.reasonMixed`. The i18n strings they reference **already exist** in `constants/i18n.ts` — the display was clearly planned.
- `components/screens/SummaryScreen.tsx` — renders a `prodIncidents` section when non-empty (`styles.incidentSection`, `incidentList`, `incidentItem`, badge classes). Model the new false-positive section on this exact block.
- Localization convention (`agent.md`): every new player-facing string goes into `constants/i18n.ts` under both `en` and `es`.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0              |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | all pass            |
| Lint      | `npm run lint`      | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `types/index.ts` (ONLY to delete the dead `claimedKind` field from `FalsePositiveRecord` — see Amendment)
- `context/GameContext.tsx` (dispatch `LOG_FALSE_POSITIVE`; return correct status; increment counter via settings)
- `constants/gameSettings.ts` (`missCounters: { falsePositives: 1 }` — counter only, **no meter changes**)
- `components/screens/SummaryScreen.tsx` (render the false-positive section; use the existing helper)
- `constants/i18n.ts` (new section strings, EN + ES)
- `tests/gameReducer.test.ts` (extend)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Meter balance: `missMeters` stays `{}` (the base `velocity: -3` on every reject already exists). Changing punishment strength is a game-design decision — flag it in Maintenance notes, don't make it.
- `components/screens/GameOverScreen.tsx` — its unused duplicate helper is removed by plan 006's dedup, which also decides whether GameOver shows false positives. Don't pre-empt it.
- `components/work/ActionPanel.tsx` feedback display — it already renders `DecisionResult.message`; verify it doesn't branch on `status === 'approved'` in a way the new status breaks (see step 2 verify).

## Git workflow

- Branch: `advisor/005-false-positive-feature`
- Conventional commits, e.g. `feat(game): track and display false-positive rejections`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Increment the counter on miss

In `constants/gameSettings.ts`, change `missCounters: {}` to `missCounters: { falsePositives: 1 }`. Leave `missMeters: {}`.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Fix the status and log the record

In `requestChanges`'s miss path (`context/GameContext.tsx:411–419`):

1. Before dispatching `APPLY_DECISION`, dispatch `LOG_FALSE_POSITIVE` with a `FalsePositiveRecord` built from the current PR — match the record type's exact fields (`types/index.ts`); for line excerpts use `extractLineExcerpts(current.files, selectedLines)` so the record shows what the player wrongly tagged (empty array when they tagged nothing); include the PR's actual `bugPatterns` kinds if the type has a field for them (that's what `formatFalsePositiveReason(actualBugKinds)` consumes).
2. Change the return to `status: 'false-positive'`.

Then check consumers of `DecisionResult.status`: `grep -rn "status" components/work/ActionPanel.tsx components/screens/WorkScreen.tsx`. `WorkScreen` stores `{ message, status }` for feedback display. If `ActionPanel` styles by status, add a case for `'false-positive'` mirroring the existing non-bonus styling; if it only prints the message, nothing more is needed.

**Verify**: `npm run typecheck` → exit 0. `npm test` → plan-001 tests still pass (none asserted the old `'approved'` miss status; if one does, that assertion documents the bug — update it and say so in the commit message).

### Step 3: Display false positives in the day summary

In `SummaryScreen.tsx`: read `falsePositiveRecords` from state (add it to the destructuring). After the existing `prodIncidents` section, render an analogous section when `falsePositiveRecords.length > 0`, using the **existing** `formatFalsePositiveReason` helper and the existing incident CSS classes (`incidentSection`, `incidentList`, `incidentItem`, `incidentSubline`). New strings (section heading, body line, e.g. "Rejected without cause" / "Rechazado sin motivo") go into `constants/i18n.ts` under the `summary` (or `incidents`) block in **both** locales, following the existing key style.

**Verify**: `npm run lint && npm run typecheck` → exit 0. Manual: `npm run dev`, start a game, reject the day-1 clean README tutorial PR (first PR — it has no bugs), end the day (or wait), and confirm the summary lists it. The falsePositives stat visible in `StatsPanel` (`counters`) increments.

### Step 4: Reducer tests

Extend `tests/gameReducer.test.ts`:
- `LOG_FALSE_POSITIVE` appends a record; `RESET_FOR_DAY` clears `falsePositiveRecords`.
- After step 1, an `APPLY_DECISION` carrying `missCounters` increments `counters.falsePositives` by 1 (import `REQUEST_CHANGES_EFFECTS` rather than hard-coding).

**Verify**: `npm test` → all pass.

## Test plan

Step 4 cases in `tests/gameReducer.test.ts` (pattern: plan 001), plus the step-3 manual check using the day-1 tutorial PRs (per `agent.md`, day 1 always starts with the clean README PR then the API-key PR — the clean one is your false-positive fixture).

## Done criteria

- [ ] `grep -n "status: 'approved'" context/GameContext.tsx` → matches only in `approveCurrentPR`, not in `requestChanges`
- [ ] `grep -n "LOG_FALSE_POSITIVE" context/GameContext.tsx` → shows both the reducer case AND a dispatch site
- [ ] `missCounters` in `constants/gameSettings.ts` is `{ falsePositives: 1 }`; `missMeters` unchanged `{}`
- [ ] `SummaryScreen` renders a false-positives section (manual check per step 3)
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0
- [ ] New i18n keys exist in both `en` and `es`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `FalsePositiveRecord` in `types/index.ts` has fields that can't be populated from the data available in `requestChanges` (current PR + selectedLines) — the type may have been designed for a different call site; report its shape.
- `ActionPanel` (or anything else) has behavior keyed on the miss path returning `'approved'` such that changing the status breaks approve/reject flow.
- The section styling requires new CSS beyond the existing incident classes — that means the design intent was different; report rather than inventing styles.

## Maintenance notes

- Deliberately deferred (game-design decisions for the maintainer): whether a false positive should also cost satisfaction (`missMeters`), and whether `GameOverScreen` should show the run's false positives (plan 006 dedups the screens and is the natural place to decide).
- Plan 006 will move `formatFalsePositiveReason` into a shared module — after this plan it finally has a caller.
- Reviewer: confirm no meter numbers changed; this plan is wiring, not rebalancing.
