-- ===========================================================================
-- Migration 0008 — B2B meeting scheduling (Cal.com-style, Supabase-native)
-- ---------------------------------------------------------------------------
-- Admin publishes open time slots; brokers / master IBs book one from the
-- public B2B page. Booking creation + admin notification is handled server-
-- side (server action with the service role), so bookings stay locked down.
-- ===========================================================================

create table if not exists public.meeting_slots (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  duration_min int not null default 30,
  meeting_url text,                          -- pre-created Zoom / Google Meet room
  status      text not null default 'open',  -- open | booked | closed
  created_at  timestamptz not null default now()
);

create index if not exists idx_meeting_slots_status on public.meeting_slots(status, starts_at);

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  slot_id      uuid references public.meeting_slots(id) on delete set null,
  company_name text not null,
  contact_name text not null,
  email        text not null,
  phone        text,
  meeting_type text,                          -- broker | master_ib | liquidity | technology
  message      text,
  status       text not null default 'pending', -- pending | confirmed | cancelled
  created_at   timestamptz not null default now()
);

create index if not exists idx_bookings_created on public.bookings(created_at desc);

alter table public.meeting_slots enable row level security;
alter table public.bookings enable row level security;

-- Anyone (even anonymous visitors) may see OPEN upcoming slots to book them.
drop policy if exists "slots read open" on public.meeting_slots;
create policy "slots read open" on public.meeting_slots
  for select using (status = 'open' or public.is_admin());

-- Only admins manage slots directly; bookings are created via the service role.
drop policy if exists "slots admin write" on public.meeting_slots;
create policy "slots admin write" on public.meeting_slots
  for all using (public.is_admin()) with check (public.is_admin());

-- Bookings are readable only by admins; inserts happen server-side (service role).
drop policy if exists "bookings admin read" on public.bookings;
create policy "bookings admin read" on public.bookings
  for select using (public.is_admin());

drop policy if exists "bookings admin write" on public.bookings;
create policy "bookings admin write" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());
