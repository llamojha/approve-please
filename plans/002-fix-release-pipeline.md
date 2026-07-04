# Plan 002: Settle the deployment story and fix the broken release workflow

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 93d5370..HEAD -- .github/workflows/release-html.yml next.config.mjs pages/api/ README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (001 recommended first so CI exists)
- **Category**: bug / dx
- **Planned at**: commit `93d5370`, 2026-07-04

## Why this matters

The tag-triggered release workflow zips an `out/` directory that nothing produces anymore: `next.config.mjs` contains no `output: 'export'`, so `npm run build` creates only `.next/`, and `out` is gitignored — the workflow's `cd out` step fails on every tag. Worse, the codebase has since grown a server API route (`pages/api/leaderboard.ts`, using a server-only `SUPABASE_SERVICE_ROLE_KEY`), and Next.js refuses to build API routes under `output: 'export'` — so the static-export release and the server-side leaderboard are architecturally incompatible. This plan makes the decision explicit: **server deployment is canonical** (it is the only mode where the API route and plan 003's leaderboard hardening can work), removes the dead workflow, and documents how the game is deployed and run.

## Current state

- `.github/workflows/release-html.yml` — on tag `v*`: `npm ci` → `npm run build` → `cd out && zip -r ../approve-please-html.zip .` → GitHub release. The `cd out` step fails because `npm run build` no longer emits `out/`.
- `next.config.mjs` — full contents today:
  ```js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
  };
  export default nextConfig;
  ```
- `pages/api/leaderboard.ts` — GET/POST Supabase leaderboard handler using `getSupabaseServiceClient()` (service-role key, server-only). Currently unused by the client (plan 003 wires clients to it — do not delete it).
- `.env.example` — documents `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (with a "keep server-side only" comment).
- `README.md` — a game design document. It contains **no setup/run/deploy instructions at all**.
- `.kiro/steering/tech.md` states: "Next.js 16 (Pages Router, standard server/SSG deployment)" — i.e. the steering docs already assume server deployment; this plan aligns reality with that.

**Decision made by this plan** (rationale inline so a reviewer can veto): keep server deployment as the only supported mode and delete the static-export release workflow. The alternative — keeping downloadable static HTML builds — would require deleting `pages/api/leaderboard.ts` and permanently accepting browser-side anon-key leaderboard writes, which plan 003 exists to remove. If the maintainer actually wants distributable offline builds, that is a STOP condition, not an improvisation.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `npm ci`            | exit 0              |
| Build     | `npm run build`     | exit 0; `.next/` produced, no `out/` |
| Typecheck | `npm run typecheck` | exit 0              |
| YAML check| `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` | exit 0 (only if 001 landed) |

## Scope

**In scope** (the only files you should modify/create/delete):
- `.github/workflows/release-html.yml` (delete)
- `README.md` (add a "Getting started" + "Deployment" section — additive; do not rewrite the design doc)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `pages/api/leaderboard.ts` — plan 003 owns it.
- `next.config.mjs` — no config change is needed for server deployment; leave it.
- Any client leaderboard code — plan 003.
- `.github/workflows/ci.yml` — plan 001 owns it.

## Git workflow

- Branch: `advisor/002-fix-release-pipeline`
- Conventional commits, e.g. `chore(ci): remove broken static-export release workflow`, `docs: add setup and deployment instructions`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Delete the broken release workflow

`git rm .github/workflows/release-html.yml`

**Verify**: `ls .github/workflows/` → shows only `ci.yml` (if plan 001 has landed) or is empty.

### Step 2: Document setup and deployment in README

Append to `README.md` (keep the existing design-doc content untouched above it) a section:

```markdown
## Development

- `npm ci` — install dependencies (Node 20+)
- Copy `.env.example` to `.env.local` and fill in the Supabase values
  (`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client or committed)
- `npm run dev` — start the dev server
- `npm run typecheck && npm run lint && npm test` — verification
- `npm run generate:templates` — regenerate the PR template manifest after
  adding/editing templates under `data/prTemplates/`

## Deployment

This app requires a Node/server deployment (e.g. Vercel or `next build && next start`):
`pages/api/leaderboard.ts` is a server route holding the Supabase service-role key,
which cannot exist in a static export. A previous static-HTML release workflow was
removed for this reason (see plans/002-fix-release-pipeline.md).
```

Adjust the test-command line if plan 001 has not landed yet (omit `npm test`).

**Verify**: `npm run build` → exit 0 (server build, `.next/` present). `test -d out && echo UNEXPECTED || echo ok` → `ok`.

## Test plan

No new automated tests — this plan deletes CI surface and adds docs. The verification gates above (successful server build, workflow file removed, YAML of remaining workflows valid) are the checks.

## Done criteria

- [ ] `.github/workflows/release-html.yml` no longer exists
- [ ] `README.md` contains a "Development" and a "Deployment" section with the content above
- [ ] `npm run build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- You find evidence the maintainer actively distributes the static HTML zip (e.g. recent GitHub releases with the asset downloaded, or a doc referencing itch.io or similar) — the "server-only" decision then needs explicit maintainer sign-off.
- `npm run build` fails for reasons unrelated to this change.
- Someone re-added `output: 'export'` to `next.config.mjs` since `93d5370` (drift — the decision context changed).

## Maintenance notes

- Plan 003 depends on this decision: it routes leaderboard traffic through the API route, which only exists in server deployments.
- If distributable offline builds are ever wanted again, the path is: a separate build config that excludes `pages/api/`, leaderboard degrading to hidden/disabled when `fetch('/api/leaderboard')` fails — design that deliberately, don't resurrect the old workflow.
- Reviewer should check the README addition doesn't contradict `.kiro/steering/tech.md` (it matches it today).
