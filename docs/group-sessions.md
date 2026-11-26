# Group review sessions

The host opens `/group`, picks PR basics (one of six shifts) or code review (TypeScript and documentation), and chooses a 2-, 5- or 10-minute day. The host shares the six-character code or `/group/CODE` link. Up to 40 players join with unique nicknames before the host starts.

The host is an observer, not a competing seat. Each browser profile has one seat per room; nicknames are not passwords. Reopening the same room in that browser reconnects the seat. Clearing cookies loses access to the seat; a nickname alone cannot reclaim it. Sharing a browser profile across players is unsupported. No email, account or Supabase Auth configuration is needed.

## Playing and discussing

Everyone gets the same ten PRs in the same order and room language. All ten are available when the host starts. Reviewers can switch between pending PRs, tag lines, approve or reject with the existing review desk, and use Alt+A / Alt+R. Accepted decisions swipe automatically. The room uses practice rules: there is no waiting drain, but decisions affect the familiar three bars. Zero bars do not eliminate students from the group exercise. There are no additional waves or random arrivals in this release.

The server owns the deadline; refreshing or opening help never pauses it. A finished player waits until everyone finishes, the shared deadline passes, or the host ends the shift. The next room request reconciles the deadline, so no long-running server timer is needed. Expiry and scoring use server time, not client-submitted timestamps.

The room leaderboard ranks correct PR decisions first, then precise issue tags. Equal results share rank; speed is not a tie-breaker. Correct rejections count even without tagged lines. Unreviewed PRs earn no credit and are displayed separately. The group recap shows the expected verdict, explanation and number of correct decisions for each PR. Each player also sees their own review notes. Other players' individual answers are not published during play. Room results never enter the existing global leaderboard.

## Persistence and API

`server/groupSessions.ts` owns content snapshots, grading and public views. `server/groupSessionStore.ts` persists versioned room documents with compare-and-swap retries; simultaneous writes cannot silently overwrite other players. Snapshotting the full content keeps deployed template changes from changing an active room's grading. New decisions and room controls are authenticated by random 256-bit HttpOnly, SameSite cookies; only SHA-256 hashes are stored in the room document. Host and seat credentials are separate. Production cookies are Secure. Writes require same-origin JSON requests; responses are private/no-store.

Endpoints:
- `POST /api/group-sessions`: `{track, day, locale, durationSeconds}`. Creates a lobby and sets the host cookie.
- `GET /api/group-sessions/CODE`: returns the caller's redacted room view.
- `POST /api/group-sessions/CODE`: `join` with `name`, host-only `start` / `finish`, or `review` with `prId`, `verdict`, `selectedRefs`.

Browser state refreshes every two seconds and immediately on returning to a backgrounded tab. Refreshing restores server progress without touching solo-game saves. Submissions are never optimistically counted: a connection failure leaves the PR available for retry. Duplicate accepted submissions cannot change the first verdict or earn extra credit. The browser sends decisions, never score totals. Answer keys, learning explanations and reaction metadata are removed from active-room payloads. The shared single-player content is public in this repository, so server scoring does not make this suitable for high-stakes exams.

## Activation

Migration status (2026-11-26): applied to the existing `llamojha-projects` Supabase project (`xxgapdjmcwbarncppntp`) with the maintainer’s explicit approval, and recorded as version `202611250001` in migration history. Table structure, index, RLS and role permissions were verified. The `codex/group-sessions` Vercel branch preview is enabled for testing with a branch-scoped Preview flag. Production remains disabled; real deployment verification is tracked in the plan. Do not rerun the CREATE TABLE script against this database.

1. For a different database, review `supabase/migrations/202611250001_group_sessions.sql` and apply it once to the intended preview database first. It creates one isolated table with RLS enabled and no browser-role access. It does not modify existing leaderboard data. Applying it to production requires the maintainer's approval.
2. Configure the existing `NEXT_PUBLIC_SUPABASE_URL` and server-only `SUPABASE_SERVICE_ROLE_KEY` for that environment. Do not expose the service key in browser configuration. No new dependency or secret is required.
3. Before public activation, add deployment-level abuse limits to room creation and joining (initial suggested bounds: 5 creates/minute/IP and 30 joins/minute/IP), and cap review writes separately. This release does not pretend process-local rate limits would protect a distributed deployment.
4. Set `GROUP_SESSIONS_ENABLED=true` in the intended preview environment after the preceding setup. Rooms remain unavailable by default. Exercise a host and at least two separate player browser profiles against the real database. Verify concurrent joins/reviews and reconnects before a classroom session. Enable the production flag only after those checks. The local memory proof cannot validate Supabase policies, network latency or a 40-player classroom load.

Missing configuration or migration returns a translated unavailable message; there is no silent production fallback. Access expires 24 hours after creation. Expired rows remain stored until an administrator removes them under the project's retention policy. Schedule retention cleanup before ongoing public use; no destructive cleanup is performed by game requests.

## Local preview

Install from the existing lockfile, then start the normal development server with `GROUP_SESSION_STORE=memory` in its environment. This explicit in-memory store is permitted only outside production. Restarting the server discards local rooms. It is for development and automated HTTP verification, not shared deployment. Use `/group` to create a room, then another browser profile to join as a player.

The plan and outstanding enhancements are tracked in `plans/020-group-sessions.md`: private Realtime channels, queue-pressure difficulty, configurable code languages, multi-day sessions, class testing, and scheduled retention cleanup.

Local HTTP verification uses `node scripts/verify-group-session.mjs --base-url http://127.0.0.1:3120` after starting that development server. The script accepts local HTTP targets only and creates disposable rooms with separate host/player cookie jars. It checks concurrent joins, identical PR assignment, answer redaction, duplicate retries, reconnect, server grading, waiting for peers, host permissions, results and a Spanish code-review room.
