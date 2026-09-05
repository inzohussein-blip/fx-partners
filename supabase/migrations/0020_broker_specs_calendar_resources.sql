-- Migration 0020 — three IB-hub features:
--   1) Broker operational spec flags (for the quick specs comparison grid)
--   2) broker_events  (broker-specific trading calendar: holidays / margin / hours)
--   3) trading_resources (gated indicator/template/ebook downloads hub)

-- 1) Broker spec flags -------------------------------------------------------
alter table public.brokers
  add column if not exists supports_ea      boolean not null default false,  -- Expert Advisors / algo
  add column if not exists allows_hedging   boolean not null default false,
  add column if not exists swap_free        boolean not null default false,  -- Islamic account
  add column if not exists allows_scalping  boolean not null default false,
  add column if not exists min_deposit      numeric(12,2),                   -- USD
  add column if not exists deposit_methods  text[] not null default '{}';    -- e.g. AsiaCell, ZainCash, Crypto

-- 2) Broker-specific trading calendar ---------------------------------------
create table if not exists public.broker_events (
  id          uuid primary key default gen_random_uuid(),
  broker_id   uuid references public.brokers(id) on delete cascade,  -- null = market-wide
  title       text not null,
  description text,
  kind        text not null default 'holiday',   -- holiday | margin | hours | news
  country     text,                               -- e.g. US, CN
  event_date  date not null,
  event_time  text,                               -- free text, e.g. "16:30 GMT"
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists broker_events_date_idx   on public.broker_events(event_date);
create index if not exists broker_events_broker_idx on public.broker_events(broker_id);

alter table public.broker_events enable row level security;
drop policy if exists "broker_events read" on public.broker_events;
create policy "broker_events read" on public.broker_events
  for select using (is_active or public.is_admin());
drop policy if exists "broker_events admin write" on public.broker_events;
create policy "broker_events admin write" on public.broker_events
  for all using (public.is_admin()) with check (public.is_admin());

-- 3) Trading resources hub (gated downloads) --------------------------------
create table if not exists public.trading_resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  kind          text not null default 'indicator', -- indicator | template | ebook | tool
  file_url      text not null,                      -- Supabase Storage public URL or external
  broker_id     uuid references public.brokers(id) on delete set null, -- unlock via this broker
  downloads     int not null default 0,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists trading_resources_active_idx on public.trading_resources(is_active, sort_order);

alter table public.trading_resources enable row level security;
drop policy if exists "trading_resources read" on public.trading_resources;
create policy "trading_resources read" on public.trading_resources
  for select using (is_active or public.is_admin());
drop policy if exists "trading_resources admin write" on public.trading_resources;
create policy "trading_resources admin write" on public.trading_resources
  for all using (public.is_admin()) with check (public.is_admin());
