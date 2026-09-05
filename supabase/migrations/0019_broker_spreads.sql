-- Per-instrument spread data powering the /spreads heatmap comparison.
-- Public read (comparison data), admin-only write.

create table if not exists public.broker_spreads (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null references public.brokers(id) on delete cascade,
  instrument text not null,                 -- e.g. XAUUSD, EURUSD, US30
  category text not null default 'forex',   -- metals | forex | indices | crypto
  spread numeric not null,                  -- typical spread (lower is better)
  updated_at timestamptz not null default now(),
  unique (broker_id, instrument)
);

create index if not exists broker_spreads_category_idx   on public.broker_spreads(category);
create index if not exists broker_spreads_instrument_idx on public.broker_spreads(instrument);
create index if not exists broker_spreads_broker_idx     on public.broker_spreads(broker_id);

alter table public.broker_spreads enable row level security;

drop policy if exists "broker_spreads read" on public.broker_spreads;
create policy "broker_spreads read" on public.broker_spreads
  for select using (true);

drop policy if exists "broker_spreads admin write" on public.broker_spreads;
create policy "broker_spreads admin write" on public.broker_spreads
  for all using (public.is_admin()) with check (public.is_admin());
