# Execution plan: running plans 001–010 in parallel waves

> **Progress (completed 2026-07-14)**: All four waves are DONE and merged into
> `preview` (plans 001–010; suite green: 92/92 tests, lint/typecheck/build
> clean). Wave 4 (plan 006) merged 2026-07-14 after verifier APPROVE. What
> remains is maintainer-only: the batched manual browser QA below and the
> post-execution actions at the bottom of this file (Supabase RLS runbook,
> learning-mode open questions, two deferred design calls).

Orchestration model: the main session (orchestrator) dispatches one
`plan-executor` agent per plan, each in an **isolated worktree** on its own
branch. When an executor finishes, a `plan-verifier` agent audits the branch
against the plan's done criteria. Only APPROVEd branches are merged into
`preview`, one at a time, with the full suite re-run after each merge. The
orchestrator — not the executors — updates the status rows in
`plans/README.md` at merge time (avoids ten agents fighting over one file).

Agent definitions: `.claude/agents/plan-executor.md`, `.claude/agents/plan-verifier.md`.

## Why these waves

Waves are constrained by two things: the declared dependencies in
`plans/README.md`, and **file overlap** (two plans editing the same file must
not run concurrently even when logically independent):

- 004 and 005 both edit `context/GameContext.tsx`, `constants/i18n.ts`,
  `tests/gameReducer.test.ts` → serialized (004 first; it's P1).
- 007 and 010 both edit `hooks/usePRSpawner.ts` → serialized (007 first, per
  plan 010's own note).
- 006 edits files that 003 and 005 touch first → last.
- Everything in a given wave is verified disjoint on the plans' in-scope lists.

## Gate 0 — maintainer sign-off (before anything runs)

- [ ] **Plan 002 decision**: server-only deployment, delete the static-export
      release workflow. Running wave 1 = accepting this. If you want
      distributable offline builds, stop and re-plan 002/003 instead.
- [ ] Optional: put a filled `.env.local` in place if you want plan 003's live
      smoke test (step 6) to exercise real Supabase; otherwise the executor
      records the documented 500-path result.

## Wave 1 — 3 executors in parallel

| Plan | Branch | Files (no overlap) |
|------|--------|--------------------|
| 001 Test baseline + CI | `advisor/001-verification-baseline` | package.json, vitest config, tests/, GameContext export keywords, ci.yml |
| 002 Deployment story | `advisor/002-fix-release-pipeline` | delete release-html.yml, README.md |
| 008 Social-card compression | `advisor/008-asset-tutorial-polish` | public/*.png, siteMetadata.ts, index.tsx:335 (rename-only) |

Merge order into `preview`: **001 → 002 → 008**, suite after each
(for 002/008 pre-001 merges, the suite is typecheck/lint/build only).

## Wave 2 — 4 executors in parallel (after wave 1 is merged)

| Plan | Branch | Files (no overlap) |
|------|--------|--------------------|
| 003 Leaderboard hardening | `advisor/003-leaderboard-hardening` | api route, utils/leaderboard, GameOverScreen, leaderboard page/modal, tests, docs/ |
| 004 Deterministic hydration | `advisor/004-deterministic-hydration` | GameContext, dayMantras/dayQuotes, HydrationErrorBoundary, i18n, tests/gameReducer |
| 007 Template bundle split | `advisor/007-split-template-bundle` | manifest generator, data/prTemplates manifests, data/prs, usePRSpawner, tests |
| 009 Deps + tsconfig | `advisor/009-deps-tsconfig` | package.json, lockfile, tsconfig |

Merge order: **003 → 004 → 007 → 009** (009 last — it bumps Next, so the
final suite run covers all merged code on the new version).

## Wave 3 — 2 executors in parallel (after wave 2 is merged)

| Plan | Branch | Why this wave |
|------|--------|---------------|
| 005 False-positive feature | `advisor/005-false-positive-feature` | shares GameContext/i18n/tests with 004 → had to wait |
| 010 Learning-mode spike | `advisor/010-learning-curriculum-spike` | shares usePRSpawner with 007 → had to wait |

Merge order: **005 → 010**.

## Wave 4 — 1 executor

| Plan | Branch | Why last |
|------|--------|----------|
| 006 Dedupe screens + leaderboard | `advisor/006-dedupe-screens-leaderboard` | pure refactor over 003's and 005's output; touches their files |

## Per-branch gate (every wave)

1. Executor reports DONE (or STOPPED — a STOP goes back to the maintainer, it
   is never "worked around").
2. `plan-verifier` audits the branch: scope, done-criteria checklist,
   full suite, diff review. REJECT → back to a fresh executor with the
   verifier's findings; never hand-patch on the orchestrator side.
3. Orchestrator merges, re-runs the suite on `preview`, updates the plan's
   status row in `plans/README.md`.

## Manual QA the agents cannot do (browser checks, batched per wave)

After wave 2 merge:
- [ ] 004: direct-load `http://localhost:3000/game`, hard-refresh twice — no
      redirect to `/`, no hydration console error (repeat with ES locale).
- [ ] 007: play day 1 — tutorial PRs at 9:00; then a run with only
      `rust`+`generic` selected — day-2 waves draw correctly.
- [ ] 008 (from wave 1, can be checked here): landing-page hero background
      renders; OG image < 300 KB.

After wave 3 merge:
- [ ] 005: reject the clean day-1 README PR — summary shows the
      false-positive section, `falsePositives` counter increments.
- [ ] 010: two learning-mode playtests — visibly easier PRs on day 1 than
      normal mode.

After wave 4 merge:
- [ ] 006: summary + game-over screens pixel-identical; leaderboard page and
      modal both load and switch modes.

## Post-execution maintainer actions (outside the repo)

- [ ] Execute `docs/leaderboard-security.md` (plan 003's runbook): remove the
      anon INSERT/SELECT policies in the Supabase dashboard, verify the game
      still works; rotate the service-role key if it was ever exposed.
- [ ] Answer the open questions in `docs/learning-mode-curriculum.md`
      (plan 010's deliverable) to unlock the full learning-mode build-out.
- [ ] Decide the two deferred design calls: false-positive `missMeters` cost,
      and false positives on GameOverScreen.

## Bookkeeping

- Total agent runs: 10 executors + 10 verifiers across 4 waves
  (max concurrency 4 in wave 2).
- Executors never push; merging and pushing `preview` is the orchestrator's
  (or maintainer's) explicit call.
- If any executor STOPs on drift, re-audit that plan before retrying — the
  plans were written against `93d5370`.
