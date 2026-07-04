# Plan 003: Route all leaderboard traffic through the API route and bound the inputs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- pages/api/leaderboard.ts utils/leaderboard.ts utils/supabaseClient.ts components/screens/GameOverScreen.tsx components/common/LeaderboardModal.tsx pages/leaderboard.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches the only networked feature; RLS change happens outside the repo)
- **Depends on**: plans/001-verification-baseline.md, plans/002-fix-release-pipeline.md
- **Category**: security
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

A validated, service-role-backed API route for the leaderboard exists (`pages/api/leaderboard.ts`) — but **nothing calls it**. All reads and writes go straight from the browser to Supabase with the public anon key. Consequences today: (1) submitted scores have no upper bound and no rate limiting — anyone can insert arbitrary rows from devtools with the anon key that ships in the JS bundle; (2) the `TRIM_LIMIT` cleanup that keeps the table at 100 rows per mode lives only in the unused route, so the table grows without bound; (3) three divergent copies of fetch/mapping logic already disagree (limit 100 vs 50). A public browser game can never make scores fully trustworthy, but this plan removes the trivial spoof/spam path and centralizes the logic where validation exists. Defensive maintenance, not a demonstration exercise: no exploit strings are needed — the fix is routing + bounds + a Supabase policy change.

## Current state

- `pages/api/leaderboard.ts` — complete GET/POST handler: `parseMode` whitelist, `parseNonNegativeInt`/`sanitizeDisplayName` validation, insert via `getSupabaseServiceClient()`, `trimLeaderboard` keeps top `TRIM_LIMIT = 100` per mode. Unused (verified: `grep -rn "api/leaderboard" components pages hooks utils context` matches only the route itself).
- `components/screens/GameOverScreen.tsx:118–144` — `submitToLeaderboard` inserts **directly** via `getSupabaseAnonClient().from("leaderboard_entries").insert({...})` with raw counter values; no bounds, no trim.
- `pages/leaderboard.tsx:45–91` — direct anon-client SELECT, `limit(100)`, maps snake_case rows to a local `LeaderboardEntry` type.
- `components/common/LeaderboardModal.tsx:47–92` — the same SELECT copy-pasted with `limit(50)`.
- `utils/leaderboard.ts` — `parseNonNegativeInt` rejects negatives/NaN/Infinity but accepts any magnitude (e.g. 1e15). `computeLeaderboardScore` = `cleanApprovals + truePositives + daysPlayed * 5`.
- `utils/supabaseClient.ts` — exports `getSupabaseServiceClient` (uses `SUPABASE_SERVICE_ROLE_KEY`, server-only) and `getSupabaseAnonClient` (uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- The `score` column is not sent by any writer yet is selected back (`.select('id, score')` in the route) and displayed — it is a database-generated column in Supabase. Keep treating it as server-computed; never accept a client-provided score.
- Error-message caveat: the route currently returns raw `error.message` from Supabase in 500 responses (lines 41, 105) — replace with a generic message and server-side `console.error`.
- Conventions: components are typed functional components with default exports; player-facing strings go through `constants/i18n.ts` + `useTranslations()` (see `agent.md` "Localization"). The two fetch call sites use plain fetch-in-`useEffect` with an `alive` flag — keep that pattern.
- Plan 006 will deduplicate the two read call sites into one client util. To avoid conflicts, this plan changes *what* they call (API route instead of Supabase), and plan 006 folds them together afterwards.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0              |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | all pass            |
| Lint      | `npm run lint`      | exit 0              |
| Dev server| `npm run dev`       | serves on :3000 (needs `.env.local` with Supabase vars for live checks; without them the API returns the 500 "not configured" path, which is still testable) |

## Scope

**In scope** (the only files you should modify/create):
- `pages/api/leaderboard.ts` (bounds, generic error messages)
- `utils/leaderboard.ts` (add upper bound constant + shared request/response types)
- `components/screens/GameOverScreen.tsx` (submit via `fetch('/api/leaderboard', { method: 'POST' ... })`)
- `pages/leaderboard.tsx`, `components/common/LeaderboardModal.tsx` (read via `fetch('/api/leaderboard?mode=...')`)
- `tests/leaderboard.test.ts` (extend), `tests/leaderboardApi.test.ts` (create)
- `docs/leaderboard-security.md` (create — the RLS runbook)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `utils/supabaseClient.ts` — keep both factories; `getSupabaseAnonClient` becomes unused by these files but deleting it is plan 006's dedup sweep after confirming no other caller.
- The Supabase project itself — you cannot run SQL from here; step 5 *documents* the policy change for the maintainer.
- Rate limiting middleware — deferred (see Maintenance notes).
- `computeLeaderboardScore` semantics and the DB `score` column.

## Git workflow

- Branch: `advisor/003-leaderboard-hardening`
- Conventional commits, e.g. `fix(leaderboard): route submissions through validated API route`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add bounds and shared types in `utils/leaderboard.ts`

Add `export const MAX_LEADERBOARD_STAT = 100_000;` and `export const parseBoundedInt = (value: unknown): number | null` that behaves like `parseNonNegativeInt` but also returns `null` above `MAX_LEADERBOARD_STAT`. Add and export a `LeaderboardEntryDto` type (`displayName, cleanApprovals, truePositives, daysPlayed, score, createdAt`) so both pages and the route share one response shape.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Harden the API route

In `pages/api/leaderboard.ts`: switch POST parsing to `parseBoundedInt`; replace both `res.status(500).json({ error: error.message })` sites with `console.error('[leaderboard]', error); res.status(500).json({ error: 'Leaderboard temporarily unavailable.' })`. Type the GET response with `LeaderboardEntryDto[]`.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Point all three client call sites at the route

- `GameOverScreen.submitToLeaderboard`: replace the anon-client insert with `fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName, cleanApprovals, truePositives, daysPlayed, mode }) })`; non-OK → throw with the response's `error` field when present. Remove the `getSupabaseAnonClient` import.
- `pages/leaderboard.tsx` and `LeaderboardModal.tsx`: replace the Supabase SELECT with `fetch('/api/leaderboard?mode=' + mode)` and use `data.entries` (already camelCase from the route — the local snake_case mapping code is deleted). Keep each file's `alive`-flag effect structure and loading/error states exactly as they are.

**Verify**: `npm run typecheck && npm run lint` → exit 0. `grep -rn "getSupabaseAnonClient" components pages` → no matches outside `utils/supabaseClient.ts`.

### Step 4: Tests

- Extend `tests/leaderboard.test.ts`: `parseBoundedInt(MAX_LEADERBOARD_STAT + 1)` → `null`; update the plan-001 "unbounded accepted" assertion accordingly.
- Create `tests/leaderboardApi.test.ts` covering the handler's pure parsing layer: import `parseMode` behavior indirectly by testing the exported helpers, or export `parseMode` from the route file and test: invalid mode → `'normal'`; valid `'learning'` passes through. (Vitest runs in node env — do not attempt to spin up Next; test the pure functions only.)

**Verify**: `npm test` → all pass.

### Step 5: Write the RLS runbook (manual step for the maintainer)

Create `docs/leaderboard-security.md` describing, without secret values: with all traffic now on the service-role route, the browser anon key no longer needs INSERT (or SELECT) on `leaderboard_entries`; the maintainer should remove those anon policies in the Supabase dashboard and verify the game still works (reads/writes go through the route). Include a rollback note (re-adding the policies restores the old behavior) and a reminder that the service-role key must exist only as a server env var — if it was ever committed or exposed client-side, rotate it in the Supabase dashboard.

**Verify**: file exists; `grep -i "key" docs/leaderboard-security.md` contains no actual key material (names of env vars only).

### Step 6: Live smoke test (if `.env.local` is configured)

`npm run dev`, then: `curl -s 'localhost:3000/api/leaderboard?mode=learning'` → 200 with `{"entries":[...]}`; `curl -s -X POST localhost:3000/api/leaderboard -H 'Content-Type: application/json' -d '{"cleanApprovals":1e12,"truePositives":0,"daysPlayed":1}'` → 400. Without env vars, both → 500 "not configured" (acceptable; note it in your report).

## Test plan

Covered in step 4. Pattern: `tests/leaderboard.test.ts` from plan 001.

## Done criteria

- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all exit 0
- [ ] `grep -rn "from(\"leaderboard_entries\")\|from('leaderboard_entries')" components pages` → matches only in `pages/api/leaderboard.ts`
- [ ] POST with any stat > 100000 or negative → HTTP 400 (curl check or handler test)
- [ ] 500 responses no longer contain Supabase `error.message`
- [ ] `docs/leaderboard-security.md` exists with the anon-policy removal + rotation guidance
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 002 was not executed / was rejected (deployment is still meant to be static export) — this plan's approach is then wrong by construction.
- The `score` column turns out NOT to be database-generated (e.g. inserts fail with "score is required") — the scoring design needs a decision, not a workaround.
- Any client code path needs the anon client for something other than the leaderboard (grep first; none exists at `93d5370`).
- The two read call sites have drifted structurally from the excerpts (plan 006 may have run first — reconcile with its changes instead of reverting them).

## Maintenance notes

- Deferred deliberately: request rate limiting on the POST route (per-IP token bucket or Vercel WAF rule) — worth doing if spam appears; the bounds + trim keep damage capped meanwhile.
- Scores remain client-computed-inputs (clean approvals etc. come from the browser). Full integrity would need server-side game validation — out of scope for a hobby game; the runbook says so.
- Plan 006 dedupes the two read call sites into one util; if it runs after this plan it should find both already calling the API route.
