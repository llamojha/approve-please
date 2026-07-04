# Plan 004: Make initial state deterministic and give the error boundary a real fallback

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- context/GameContext.tsx components/common/HydrationErrorBoundary.tsx data/dayMantras.ts data/dayQuotes.ts constants/i18n.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

The game's initial state is created **at module scope with random values**: `createInitialState()` calls `getDayMantra()` and `getRandomDayQuote()` when `GameContext.tsx` is first imported (lines 120–122 via 128). The server picks one random mantra/quote at build/render time, the browser picks another at hydration, `BriefingScreen` renders them (lines 14–16), and React throws a hydration mismatch on any direct load or refresh of `/game`. Instead of fixing the root cause, `HydrationErrorBoundary` catches the mismatch and `Router.replace('/')` — ejecting the player to the landing page. Worse, for **every other error** the boundary neither sets fallback state nor logs in production (`componentDidCatch` logs only when `NODE_ENV !== 'production'`), so a production runtime error unmounts the tree into a silent blank screen. This plan makes the initial state deterministic (randomness moves to client-side dispatch), which eliminates the mismatch class, and turns the boundary into an honest catch-all with a visible fallback.

## Current state

- `context/GameContext.tsx`:
  ```ts
  // lines 108–128 (abridged)
  const createInitialState = (): GameState => {
    return {
      ...
      currentMantra: getDayMantra(),      // random pick
      dayQuote: getRandomDayQuote(),      // random pick
      ...
    };
  };
  const initialState: GameState = createInitialState();   // module scope!
  ```
  Randomness also enters via `RESET_FOR_DAY` (`dayQuote: getRandomDayQuote()`, line 268) and `advanceToNextDay` (`getDayMantra()`, line 440) — those run only on user interaction (client-side), so they are safe; leave them.
- `data/dayMantras.ts:213` — `export const getDayMantra = (): DayMantra => { ... }` returns a random entry from a bilingual array. `data/dayQuotes.ts` — `getRandomDayQuote()` likewise. Both files export their underlying arrays or can be made to (check: if the arrays aren't exported, add exports).
- `components/screens/BriefingScreen.tsx:14–16` — renders `currentMantra?.[locale]` and `dayQuote.text[locale]`; this is the content that mismatches.
- `components/common/HydrationErrorBoundary.tsx`:
  ```ts
  // lines 29–46 (abridged)
  static getDerivedStateFromError(error: Error) {
    if (isHydrationError(error)) return { hasError: true, message: error.message };
    return null;                                  // ← non-hydration: no fallback state
  }
  componentDidCatch(error, errorInfo) {
    if (isHydrationError(error)) { Router.replace('/'); }   // ← ejects the player
    else if (process.env.NODE_ENV !== 'production') { console.error(...); }  // ← silent in prod
  }
  ```
- i18n convention (`agent.md`): all player-facing copy goes through `constants/i18n.ts` and `useTranslations()`; the boundary is a class component using `LocaleContext` via `contextType` and reads `TRANSLATIONS[locale].hydration.refreshing` — extend that same `hydration` block (rename concerns: keep the key name, add a sibling).
- `GameProvider` (`context/GameContext.tsx:308`) is a client component mounted in `pages/_app.tsx` for every page.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0              |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | all pass            |
| Build     | `npm run build`     | exit 0              |
| Dev       | `npm run dev`       | manual check below  |

## Scope

**In scope** (the only files you should modify):
- `context/GameContext.tsx`
- `data/dayMantras.ts`, `data/dayQuotes.ts` (add deterministic getters/exports only)
- `components/common/HydrationErrorBoundary.tsx`
- `constants/i18n.ts` (add the new fallback strings, EN + ES)
- `tests/gameReducer.test.ts` (extend)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `BriefingScreen.tsx` — it renders whatever state holds; no change needed.
- The randomize-per-day behavior in `RESET_FOR_DAY` / `advanceToNextDay` — keep it.
- Persisting game state across reloads — that is a direction item (see plans/README.md), not this fix.

## Git workflow

- Branch: `advisor/004-deterministic-hydration`
- Conventional commits, e.g. `fix(hydration): make initial mantra/quote deterministic`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Deterministic initial state + client-side randomize action

1. In `data/dayMantras.ts` add `export const getDefaultDayMantra = (): DayMantra => MANTRAS[0];` (use the actual array name in the file). Same in `data/dayQuotes.ts`: `getDefaultDayQuote`.
2. In `context/GameContext.tsx`: `createInitialState` uses the two default getters instead of the random ones.
3. Add a reducer action `{ type: 'RANDOMIZE_DAY_FLAVOR'; mantra: DayMantra; quote: DayQuote }` that sets `currentMantra`/`dayQuote` **only if `state.phase === 'BRIEFING' && state.currentDay === 1 && state.history.length === 0`** (so a mid-game remount can't reshuffle the current day's flavor).
4. In `GameProvider`, add:
   ```ts
   useEffect(() => {
     dispatch({ type: 'RANDOMIZE_DAY_FLAVOR', mantra: getDayMantra(), quote: getRandomDayQuote() });
   }, []);
   ```
   `useEffect` never runs during SSR/hydration's first pass, so server HTML and client hydration both render the deterministic defaults; the random flavor appears immediately after mount.

**Verify**: `npm run typecheck` → exit 0. `npm test` → existing reducer tests still pass.

### Step 2: Reducer tests for the new action

Extend `tests/gameReducer.test.ts`: `RANDOMIZE_DAY_FLAVOR` replaces mantra/quote on a fresh day-1 BRIEFING state; it is a no-op (same state object) when `phase !== 'BRIEFING'` or `currentDay !== 1` or `history.length > 0`.

**Verify**: `npm test` → all pass, including the new cases.

### Step 3: Honest error boundary

Rework `HydrationErrorBoundary.tsx`:

- `getDerivedStateFromError` returns `{ hasError: true, isHydration: isHydrationError(error), message: error.message }` for **all** errors.
- `componentDidCatch` always `console.error(error, errorInfo)` (production included). Keep `Router.replace('/')` **only** for the hydration case as a belt-and-braces path (after step 1 it should never fire).
- `render()` on error: for hydration errors keep the current "refreshing" message; for other errors render the same centered layout with a new i18n string (add to `constants/i18n.ts` under the existing `hydration` block, EN + ES, e.g. `crashed: 'Something went wrong. Reload the page to continue.'` / `'Algo salió mal. Recarga la página para continuar.'`) plus a `<button onClick={() => window.location.reload()}>` using a second new string (`reloadButton`). Match the inline-style pattern already used in this component for the fallback (it renders outside the CSS-module tree; inline styles here are the existing convention).

**Verify**: `npm run typecheck && npm run lint` → exit 0.

### Step 4: Manual hydration check

`npm run build && npm run start` (or `npm run dev`), then load `http://localhost:3000/game` **directly** (fresh tab, not client-side navigation) and hard-refresh twice.

**Verify**: the briefing screen stays put — no redirect to `/`, no hydration warning in the browser console. Repeat with locale switched to ES from the landing page first.

## Test plan

- Reducer: new `RANDOMIZE_DAY_FLAVOR` cases (step 2) in `tests/gameReducer.test.ts`, following the plan-001 structure.
- Manual: step 4 (hydration is a browser-level behavior; don't attempt to unit-test it).

## Done criteria

- [ ] `grep -n "getDayMantra()\|getRandomDayQuote()" context/GameContext.tsx` shows no call inside `createInitialState` (calls in `advanceToNextDay`/`RESET_FOR_DAY`/the new effect are fine)
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0
- [ ] Direct load of `/game` does not redirect to `/` and logs no hydration error (manual, step 4)
- [ ] `HydrationErrorBoundary` renders a visible fallback with a reload button for a thrown non-hydration error (temporarily `throw new Error('x')` in a child to check, then remove — verify removal with `git diff`)
- [ ] New i18n strings exist in both `en` and `es` blocks of `constants/i18n.ts`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Hydration errors persist after step 1 — something else non-deterministic renders on first paint; report the mismatching markup from the console instead of adding suppressions.
- The mantra/quote arrays in `data/` are not plain exported (or exportable) arrays.
- Any test from plan 001 fails after your reducer change in a way the new action can't explain.

## Maintenance notes

- Anyone adding new randomized content that renders on first paint (e.g. random PR author avatars on the briefing screen) must follow the same pattern: deterministic initial value + randomize via dispatch in an effect.
- Reviewer: check that `RANDOMIZE_DAY_FLAVOR`'s guard can't overwrite flavor mid-run (that's what the `history.length === 0` condition is for).
- Follow-up deferred: persisting the run across reloads (direction item in plans/README.md) would make refresh-during-play lossless; this plan only stops the redirect-and-lose-everything behavior on `/game` entry.
