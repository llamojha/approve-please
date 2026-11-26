-- Prepare only: apply to the intended Supabase environment after review.
-- New isolated table; no changes to the existing global leaderboard.
create table public.group_sessions (
  code text primary key check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  version integer not null default 0 check (version >= 0),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index group_sessions_expiry_idx on public.group_sessions (expires_at);
alter table public.group_sessions enable row level security;
revoke all on table public.group_sessions from anon, authenticated;
grant select, insert, update on table public.group_sessions to service_role;
comment on table public.group_sessions is 'Private 24h review rooms. All access through authenticated seat/host API handlers.';
