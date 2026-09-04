-- ===========================================================================
-- Migration 0014 — Trading signals + outbound webhook broadcast
-- ---------------------------------------------------------------------------
-- Admin publishes an analysis/signal; the app broadcasts it to a Telegram
-- channel (TELEGRAM_SIGNALS_CHAT_ID) and to any configured outbound webhooks
-- (Discord/Skype/custom). Agents also see a live feed in their dashboard.
-- Supabase-native — direct fetch, no Svix.
-- ===========================================================================

create table if not exists public.signals (
  id           uuid primary key default gen_random_uuid(),
  broker_id    uuid references public.brokers(id) on delete set null,
  title        text not null,
  body         text not null,
  symbol       text,                     -- e.g. XAUUSD
  direction    text,                     -- buy | sell | neutral
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists idx_signals_pub on public.signals(is_published, published_at desc);

create table if not exists public.outbound_webhooks (
  id         uuid primary key default gen_random_uuid(),
  label      text,
  url        text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.signals          enable row level security;
alter table public.outbound_webhooks enable row level security;

-- Signals: readable by any authenticated partner; managed by admins.
drop policy if exists "signals read" on public.signals;
create policy "signals read" on public.signals
  for select using (is_published or public.is_admin());
drop policy if exists "signals admin write" on public.signals;
create policy "signals admin write" on public.signals
  for all using (public.is_admin()) with check (public.is_admin());

-- Webhook endpoints: admin-only (may contain secret URLs).
drop policy if exists "webhooks admin all" on public.outbound_webhooks;
create policy "webhooks admin all" on public.outbound_webhooks
  for all using (public.is_admin()) with check (public.is_admin());

-- Live feed for agents.
do $$ begin
  alter publication supabase_realtime add table public.signals;
exception when duplicate_object then null; end $$;
