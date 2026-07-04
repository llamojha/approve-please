# Plan 009: Clear dependency advisories and modernize tsconfig target

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- package.json package-lock.json tsconfig.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW–MED (a Next minor bump; gated by the full test/build suite)
- **Depends on**: plans/001-verification-baseline.md (the suite is the safety net for the bumps)
- **Category**: deps / dx
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

`npm audit --omit=dev` at `93d5370` reports: **ws 8.0.0–8.20.1 (high**, uninitialized memory disclosure + DoS advisories, pulled in via `@supabase/supabase-js` → realtime client — the app never opens realtime sockets, so reachability is low, but the fix is free) and **postcss (moderate**, fixed by Next ≥16.2.10; the repo pins `next@16.0.10`). Separately, `tsconfig.json` sets `"target": "es5"`, which TypeScript has deprecated (TS 7 will refuse it — building with a newer `npx tsc` already errors with TS5107) and which no supported browser needs. Also cosmetic but confusing: `package.json`'s `description` is the literal string `"## 1. Overview"` and `main: "index.js"` points at nothing.

## Current state

- `package.json` — deps: `@supabase/supabase-js ^2.87.1`, `next 16.0.10` (exact pin), `react`/`react-dom` `^19.2.0`. `description: "## 1. Overview"`, `main: "index.js"`, empty `keywords`/`author`.
- `tsconfig.json:3` — `"target": "es5"`; `types: ["node", "webpack-env"]`; devDeps include `@types/webpack-env` (check usage: `grep -rn "module.hot\|webpack" --include='*.ts*' components context hooks pages utils constants types` — if nothing, the type package is removable).
- `npm audit` output (2026-07-04): ws high (fix via `npm audit fix`), postcss moderate (fix = next 16.2.10).
- Verification suite from plan 001: `npm run typecheck && npm run lint && npm test && npm run build`.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Install   | `npm ci` | exit 0 |
| Audit     | `npm audit --omit=dev` | after this plan: 0 high, 0 moderate (or documented residual) |
| Suite     | `npm run typecheck && npm run lint && npm test && npm run build` | all exit 0 |
| Dev smoke | `npm run dev` | game loads, day 1 playable |

## Scope

**In scope**:
- `package.json`, `package-lock.json` (ws fix, next bump to latest 16.x, metadata cleanup, possibly remove `@types/webpack-env`)
- `tsconfig.json` (`target`, possibly `types`)
- `plans/README.md` (status row)

**Out of scope**:
- React 19 → anything, Next 16 → 17 (no major bumps).
- `@supabase/supabase-js` major changes.
- Any source-file change. If a bump forces source edits beyond trivial type fixes, STOP.

## Git workflow

- Branch: `advisor/009-deps-tsconfig`
- Conventional commits, e.g. `chore(deps): fix ws advisory and bump next to 16.x latest`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: ws advisory

`npm ci && npm audit fix` (NOT `--force`). Confirm the lockfile change is limited to `ws` (and its parents' ranges).

**Verify**: `npm audit --omit=dev` → ws high advisory gone. Full suite → green.

### Step 2: Next minor bump

`npm install next@^16.2.10 eslint-config-next@^16.2.10` (align the eslint config with the runtime). 

**Verify**: full suite green; `npm run dev` smoke test — landing page, start game, day-1 tutorial PRs appear, approve one, reject one. `npm audit --omit=dev` → postcss moderate gone.

### Step 3: tsconfig modernization

Set `"target": "es2017"`. If the step-3 grep in "Current state" found no webpack references, remove `"webpack-env"` from `types` and `@types/webpack-env` from devDependencies.

**Verify**: `npm run typecheck` → exit 0 (and no TS5107 deprecation warning). `npm run build` → exit 0.

### Step 4: package.json metadata

Set `description` to `"Approve Please — a Papers, Please-style pull-request review game"`, remove the stale `"main": "index.js"` field, add `"private": true` (this is an app, not a publishable package).

**Verify**: `npm run build` → exit 0; `node -e "JSON.parse(require('fs').readFileSync('package.json'))"` → exit 0.

## Test plan

No new tests; the plan-001 suite plus the dev smoke in step 2 is the gate.

## Done criteria

- [ ] `npm audit --omit=dev` reports no high or moderate advisories (or the residual is documented in the commit message with reachability reasoning)
- [ ] `tsconfig.json` target is `es2017`; no TS deprecation warning
- [ ] `package.json` has a real description, no `main` field, `"private": true`
- [ ] Full suite green; dev smoke passed
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm audit fix` wants to change anything other than `ws` and its dependency chain.
- The Next 16.x bump breaks build/tests/dev in a way not fixed by reading its release notes for a config rename (one attempt allowed; then stop with the error).
- Raising the TS target surfaces type errors in source files (would mean code relies on es5 downlevel semantics — report, don't refactor).

## Maintenance notes

- Keep `next` and `eslint-config-next` versions moving together.
- The ws advisory came via Supabase's realtime client, which this app doesn't use; if bundle work in plan 007 continues, `@supabase/supabase-js`'s tree-shaking of realtime is worth a look later.
