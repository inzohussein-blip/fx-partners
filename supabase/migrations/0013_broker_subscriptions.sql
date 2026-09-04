-- ===========================================================================
-- Migration 0013 — Broker bonus/terms alert subscriptions
-- ---------------------------------------------------------------------------
-- Visitors subscribe to a broker; when an admin changes its bonus/terms from
-- the dashboard, the app emails the subscribers (handled in the saveBroker
-- server action). Supabase-native — no external notification service.
-- ===========================================================================

create table if not exists public.broker_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  broker_id  uuid not null references public.brokers(id) on delete cascade,
  email      text not null,
  user_id    uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (broker_id, email)
);
create index if not exists idx_broker_subs_broker on public.broker_subscriptions(broker_id);

alter table public.broker_subscriptions enable row level security;

-- Anyone may subscribe; only admins can read/manage the list (privacy).
drop policy if exists "subs public insert" on public.broker_subscriptions;
create policy "subs public insert" on public.broker_subscriptions
  for insert with check (email is not null);

drop policy if exists "subs admin read" on public.broker_subscriptions;
create policy "subs admin read" on public.broker_subscriptions
  for select using (public.is_admin());

drop policy if exists "subs admin write" on public.broker_subscriptions;
create policy "subs admin write" on public.broker_subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
