# Plan 001: Establish a test baseline (Vitest) and a PR CI workflow

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- context/GameContext.tsx utils/ constants/gameSettings.ts package.json .github/workflows/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

This repo has zero tests, no test script, and no CI that runs on pull requests (the only workflow is a tag-triggered release build that is itself broken — see plan 002). The core scoring reducer in `context/GameContext.tsx` has needed three bug-fix commits recently (`fix: score input`, `fix: score input mode learning`, `feat: add velocity as game over condition`), which is the signature of logic changed by hand with no safety net. Every other plan in `plans/` relies on this one existing first: they all use `npm test` as a verification gate.

## Current state

- `package.json` — scripts are `dev`, `build`, `start`, `lint`, `typecheck`, `generate:templates`. There is no `test` script and no test-related devDependency.
- `context/GameContext.tsx` — the whole game state machine. `gameReducer` (lines 217–304) is a pure function: perfect unit-test target. Key helpers above it are also pure: `computeQueueDrain` (130), `getQueueAgingDelta` (142), `applyCounterDelta` (165), `applyMeterDelta` (173), `extractLineExcerpts` (181), `maybeGameOver` (197). Note: `gameReducer` and those helpers are currently **not exported** — step 2 exports them for testing.
- A real inconsistency to pin with a test: `maybeGameOver` (GameContext.tsx:197–215) ends the game when stability, satisfaction, **or velocity** hits `MIN_METER_VALUE`, but `advanceToNextDay` (GameContext.tsx:436) re-checks only `stability <= 0 || satisfaction <= 0`. Because meters only change during the WORK phase and every meter change passes through `maybeGameOver`, the `advanceToNextDay` check is redundant legacy — write a characterization test documenting current behavior, do NOT change the logic in this plan.
- `utils/helpers.ts` — pure functions: `clamp`, `minutesToClock`, `formatMeterValue`, `calculateQueuePressure`, `calculateQueueChevronCount`, `meterColorFromValue`.
- `utils/leaderboard.ts` — pure functions: `computeLeaderboardScore`, `parseNonNegativeInt`, `sanitizeDisplayName`.
- `utils/pr.ts` — `instantiatePullRequest(template, day, index, locale)` builds a `PullRequest` from a template; handles the localized-metadata fallback chain (`localized[locale] ?? localized.en ?? base field`).
- `utils/language.ts` — `getCodeLanguages`, `matchesLanguagePreference`, `formatLanguageLabel`.
- `constants/gameSettings.ts` — all tuning constants (`SEVERITY_WEIGHTS`, `DECISION_EFFECTS`, `APPROVAL_EFFECTS`, `REQUEST_CHANGES_EFFECTS`, meter min/max). Import these in tests rather than hard-coding numbers, so balance changes don't break tests spuriously.
- Conventions: TypeScript strict, Next.js 16 Pages Router, no path aliases (relative imports). Commit style is conventional commits, e.g. `feat: add velocity as game over condition`.
- Node in CI: the existing workflow (`.github/workflows/release-html.yml`) uses Node 20 with npm cache; match that.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0 (node_modules may be missing before this — always run it first) |
| Typecheck | `npm run typecheck` | exit 0, no errors   |
| Lint      | `npm run lint`      | exit 0              |
| Tests     | `npm test`          | all pass (exists after step 1) |
| Build     | `npm run build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `package.json`, `package-lock.json` (add vitest devDependencies + `test` script)
- `vitest.config.ts` (create)
- `tests/gameReducer.test.ts` (create)
- `tests/helpers.test.ts` (create)
- `tests/leaderboard.test.ts` (create)
- `tests/pr.test.ts` (create)
- `tests/language.test.ts` (create)
- `context/GameContext.tsx` (ONLY to add `export` keywords — no logic changes)
- `.github/workflows/ci.yml` (create)
- `tsconfig.json` (only if vitest types require adding `"vitest/globals"` — prefer explicit imports instead and leave tsconfig untouched)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Any behavior change in `GameContext.tsx`, `gameSettings.ts`, or anywhere else. This plan documents current behavior; fixing anything it reveals belongs to later plans.
- `.github/workflows/release-html.yml` — plan 002 owns it.
- React component tests / jsdom — not in this plan; unit tests of pure logic only.

## Git workflow

- Branch: `advisor/001-verification-baseline`
- Conventional commits, e.g. `test: add vitest baseline for game reducer and utils`, `ci: add PR workflow`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install and wire Vitest

`npm ci`, then `npm install --save-dev vitest`. Add to `package.json` scripts: `"test": "vitest run"`. Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node'
  }
});
```

No jsdom needed — these are pure-logic tests. Use explicit `import { describe, it, expect } from 'vitest'` in each test file so tsconfig needs no changes.

**Verify**: `npm test` → runs, reports "no test files found" or passes with 0 tests (either is fine at this step). `npm run typecheck` → exit 0.

### Step 2: Export the reducer and pure helpers from GameContext

In `context/GameContext.tsx`, add `export` to: `gameReducer`, `createInitialState`, `maybeGameOver`, `getQueueAgingDelta`, `computeQueueDrain`. Also export the `GameState` interface and `GameAction` type. Change nothing else — the diff must be `export ` insertions only.

**Verify**: `npm run typecheck` → exit 0. `git diff context/GameContext.tsx` shows only added `export` keywords.

### Step 3: Reducer characterization tests

Create `tests/gameReducer.test.ts`. Build states via `createInitialState()` and spread-modify. Cover at least:

1. `ADVANCE_TIME` in phase `WORK` advances `currentTime` and transitions to `SUMMARY` at `WORK_DAY_MINUTES`.
2. `ADVANCE_TIME` in any non-WORK phase returns state unchanged (same object).
3. `ADVANCE_TIME` with a non-empty queue on `difficulty: 'normal'` drains velocity and satisfaction (queue aging); with `difficulty: 'learning'` it does not.
4. `maybeGameOver`: each of stability/satisfaction/velocity at `MIN_METER_VALUE` produces phase `GAME_OVER` with the matching `gameOverReason` (`'stability' | 'satisfaction' | 'velocity'`). **This is the regression test for the recently added velocity condition.**
5. `QUEUE_PRS` merges the queue and sets `currentPR` to the first item when none is selected; empty `prs` array is a no-op.
6. `APPLY_DECISION` removes the processed PR, advances `currentPR` to the next queue head, applies counter and meter deltas, and clamps meters to `[MIN_METER_VALUE, MAX_METER_VALUE]`.
7. `RESET_FOR_DAY` resets time/queue/counters/incidents but **preserves meters** (current behavior — meters persist across days).
8. `RESET_GAME` preserves `languagePreference` and `difficulty`.

Import all tuning numbers from `constants/gameSettings.ts` (e.g. expect drain per the `QUEUE_AGING_*` constants), never as literals. Construct minimal `PullRequest` fixtures inline (see `types/index.ts` for the shape; `importance: 'normal'`, one file, one line is enough).

**Verify**: `npm test` → all pass.

### Step 4: Utility tests

- `tests/helpers.test.ts`: `clamp` bounds; `minutesToClock(0)` → `"09:00"`, `minutesToClock(480)` → `"17:00"`; `formatMeterValue` trims trailing zeros (`12.5` → `"12.5"`, `12` → `"12"`, `12.345` → `"12.35"` — confirm exact rounding behavior from the implementation before asserting); `calculateQueuePressure` sums importance weights.
- `tests/leaderboard.test.ts`: `computeLeaderboardScore` = cleanApprovals + truePositives + daysPlayed*5; `parseNonNegativeInt` → `null` for negative, `NaN`, `Infinity`, non-numeric strings; floors floats; **note it currently accepts unbounded magnitudes (e.g. 1e15) — assert that as current behavior with a comment referencing plan 003, which adds an upper bound and will update this test**. `sanitizeDisplayName`: empty/whitespace → `'Anonymous reviewer'`, truncates to 64 chars.
- `tests/pr.test.ts`: `instantiatePullRequest` with a minimal template — copies files/bugPatterns deeply (mutating the result does not mutate the template), id starts with `templateId`, locale `'es'` picks `localized.es` fields and falls back to `localized.en` then base fields.
- `tests/language.test.ts`: `getCodeLanguages` canonicalizes aliases (`ts` → `typescript`) and excludes config languages (`markdown`, `yaml`); `matchesLanguagePreference` returns true for empty preference; generic (config-only) filesets match only when `'generic'` is in the preference.

**Verify**: `npm test` → all pass. `npm run lint` → exit 0.

### Step 5: Add PR CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

**Verify**: `npx --yes yaml-lint .github/workflows/ci.yml` if available, otherwise validate the YAML parses: `node -e "require('js-yaml')"` is NOT available — instead run `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0. Then run the same four commands locally in order → all exit 0.

## Test plan

This plan *is* the test plan. Expected new files: 5 test files, ≥ 25 assertions total, all passing via `npm test`.

## Done criteria

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 with ≥ 5 test files passing
- [ ] `npm run build` exits 0
- [ ] `git diff context/GameContext.tsx` contains only `export` keyword additions
- [ ] `.github/workflows/ci.yml` exists and its YAML parses
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The reducer's behavior contradicts an assertion listed in step 3 (e.g. `RESET_FOR_DAY` actually resets meters). That means either drift or a wrong assumption in this plan — report the discrepancy, don't "fix" the reducer.
- `npm ci` fails or vitest cannot be installed cleanly.
- Making `gameReducer` exportable requires anything beyond adding `export` keywords.
- `npm run build` fails for reasons unrelated to your changes (pre-existing breakage — report it; plan 002 may be the cause/fix).

## Maintenance notes

- Later plans (003, 004, 005) add or modify reducer behavior; each must extend `tests/gameReducer.test.ts` rather than creating parallel test files.
- The unbounded-int assertion in `tests/leaderboard.test.ts` is deliberately temporary; plan 003 flips it.
- Deferred: React component tests (jsdom) and spawner tests (`hooks/usePRSpawner.ts` needs refactoring to be testable — its wave logic lives inside a hook with module-level state; extract pure functions first if coverage is wanted there later).
