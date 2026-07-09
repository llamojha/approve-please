# Leaderboard Security Runbook

As of plan 003, **all** leaderboard traffic (reads and writes) goes through
`pages/api/leaderboard.ts`, which uses the server-side service-role client
(`getSupabaseServiceClient`). The browser no longer talks to Supabase
directly, so the public anon key no longer needs any access to the
`leaderboard_entries` table.

## Manual step: remove the anon policies (Supabase dashboard)

This cannot be done from the repo — a maintainer must do it in the Supabase
dashboard (Authentication → Policies, or the SQL editor):

1. Remove the RLS policy that allows the `anon` role to **INSERT** into
   `leaderboard_entries`.
2. Remove the RLS policy that allows the `anon` role to **SELECT** from
   `leaderboard_entries` (reads now come from the API route too).
3. Keep RLS **enabled** on the table. The service-role key bypasses RLS, so
   the API route keeps working with no policies present.

### Verify after the change

- Open the game, finish a run, and submit a score — the POST to
  `/api/leaderboard` should succeed.
- Open the leaderboard page (`/leaderboard`) and the in-game leaderboard
  modal — both should list entries via `GET /api/leaderboard?mode=...`.
- From the browser devtools console, a direct Supabase REST call with the
  public anon key against `leaderboard_entries` should now be denied.

### Rollback

Re-adding the anon INSERT/SELECT policies in the dashboard restores the old
direct-from-browser behavior. Nothing in the app depends on the policies
being absent — the API route works either way.

## Key hygiene

- `SUPABASE_SERVICE_ROLE_KEY` must exist **only** as a server-side
  environment variable (Vercel project env / `.env.local`). It must never be
  prefixed with `NEXT_PUBLIC_`, committed to the repo, or shipped to the
  client bundle.
- If the service-role key was ever committed or exposed client-side, rotate
  it immediately in the Supabase dashboard (Settings → API) and update the
  server env var.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` still ships in the client bundle (that is
  expected for anon keys); once the anon policies above are removed it grants
  no access to the leaderboard table.

## Known limitations (accepted)

- Score inputs (clean approvals, true positives, days played) are still
  computed client-side and submitted by the browser; the route validates
  types and bounds (`MAX_LEADERBOARD_STAT`) but cannot prove a run actually
  happened. Full integrity would require server-side game validation, which
  is out of scope for a hobby game.
- No request rate limiting on the POST route yet (deferred; see plan 003
  maintenance notes). Bounds plus the 100-row-per-mode trim keep damage
  capped meanwhile.
