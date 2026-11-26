# Group review sessions

Goal: a host starts one shared review day; players join with nicknames, review the same ten PRs independently, and discuss the room leaderboard and per-PR results.

Scope: PR basics (six authored shifts) and code review (a balanced TypeScript/docs set), 2/5/10-minute practice shifts, lobby, server deadline, reconnect, independent decisions, shared results and personal explanations. Keep individual runs and global leaderboard unchanged. No accounts, multi-day campaign or team scoring in this first version.

Architecture: existing Next.js API routes and Supabase service client. A new RLS-protected `group_sessions` table stores a versioned room document; conditional updates retry concurrent writes. Anonymous seats and host ownership use random HttpOnly cookie credentials with only hashes stored. No extra signing secret or Supabase Auth setting is required. Fetch room state every two seconds (fallback and initial transport); all writes use the API. Realtime subscriptions remain a later enhancement. The server snapshots the assigned content and grades decisions with the existing evaluator. Active payloads omit answers, explanations and reactions. No client score totals are accepted.

TODO:
- [x] Add `server/groupSessions.ts`, `server/groupSessionStore.ts`, `types/groupSessions.ts` and `supabase/migrations/202611250001_group_sessions.sql`: room transitions, redacted views, secure seat ownership and atomic persistence.
- [x] Add `pages/api/group-sessions/index.ts` and `pages/api/group-sessions/[code].ts`: bounded inputs, same-origin writes, cookie authentication, expiry, retries, errors and no-store responses.
- [x] Add bilingual `pages/group.tsx`, `pages/group/[code].tsx`, shared room UI and `styles/GroupSessions.module.css`. Reuse `ReviewDesk`, avatars, theme and audio; preserve automatic swipe and keyboard controls. Add landing navigation.
- [x] After implementation, cover deadline boundaries, duplicate/concurrent decisions, authorization, redaction, scoring, all-finished closure, result privacy and reconnect with focused tests. Run typecheck, lint and production build; inspect real browser desktop/mobile.
- [x] Document setup, data retention, local memory preview and production activation in `docs/group-sessions.md`. Report exactly which checks ran and deployment prerequisites.

Future TODO:
- [ ] Private Supabase Realtime channels for lobby/progress, retaining polling recovery.
- [ ] Timed queue waves and queue-drain difficulty, configurable languages and multi-day sessions.
- [ ] Test with an actual class before increasing the room cap beyond 40 players.
- [ ] Scheduled cleanup of expired room rows; first release expires access after 24 hours and documents manual retention cleanup.

Validation: implement before tests (no TDD). Targeted Vitest with one worker, then typecheck/lint/build. Exercise create/join/start/review/reconnect/results through the real local API with isolated cookie jars, and inspect live room screens in a browser. Local memory storage must be explicit, development-only and never a production fallback.

Risks: server scoring cannot prevent players from consulting public source or another solo-game tab. Room codes permit joining, but do not confer host authority; active answers and other players' decisions stay private. Server timestamps determine cutoffs, including background tabs; a player who finishes waits for the whole room. No server timer process is required: requests reconcile expiry. The migration creates only a new isolated table; do not apply it or alter production settings without user approval. Roll back code normally; preserve the new table until any needed results are retained.

## Verification and activation status

Implemented locally on `codex/group-sessions`, based on freshly fetched `origin/main` at `f760b50`. No production data or configuration was changed. Publication to a PR against `preview` was authorized on 2026-11-26. The preview branch is behind main, so the PR also brings the already merged refresh and beginner track into preview.

Validation: 655 tests across 25 files passed with one worker; typecheck, lint, template generation (390 code templates), and production build passed. The standalone local HTTP verifier passed against the actual Next.js routes with independent host/player cookie jars. Browser proof covers a full ten-PR shift (9/10 after a deliberate bad approval), refresh/resume, native recap expansion, a separate three-seat room, host-only early finish with unreviewed counts, mobile queue navigation, precise line tagging, Alt+A, help and audio dialogs, dark/light themes and translated controls at 320 px. Content language is fixed by the host; changing interface language does not alter the assigned PRs. Proof images are outside the repository in the local group-preview artifact folder.

Production TODO:
- [x] Apply the isolated migration to the verified Supabase project with maintainer approval (2026-11-26; existing `llamojha-projects` database).
- [ ] Configure deployment-level abuse limits and retention cleanup before public activation.
- [ ] Enable `GROUP_SESSIONS_ENABLED=true` for preview and verify real Supabase concurrent writes, permissions and reconnect using separate browser profiles.
- [x] Publication authorized from `codex/group-sessions` to a PR against `preview`; no push or PR to main.

Live database connectivity follow-up: the existing Supabase CLI sign-in successfully listed the healthy `llamojha-projects` project and ran read-only SQL through an isolated scratch link. Confirmed `public.leaderboard_entries` exists and `public.group_sessions` does not. The deployed Approve Please leaderboard API returned HTTP 200, and Vercel lists the expected Supabase variable names. No application tables, data, policies or deployment settings were changed. This verifies connectivity, not group-session persistence: migration approval and real multiplayer database validation remain pending.

Migration applied on 2026-11-26 at the user’s explicit request: ran the prepared `202611250001_group_sessions.sql` inside a transaction against Supabase project `xxgapdjmcwbarncppntp` (`llamojha-projects`), then registered version `202611250001` as applied using the CLI migration-history command. Verified all five columns, the expiry index, RLS enabled, no SELECT/INSERT/UPDATE privileges for anon or authenticated browser roles, and SELECT/INSERT/UPDATE privileges for service_role. The existing leaderboard API still returns HTTP 200. No application feature flag, deployment settings or existing leaderboard data was changed. Real Supabase-backed group-session API validation and preview activation remain pending.
