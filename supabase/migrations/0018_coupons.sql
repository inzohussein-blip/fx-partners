-- ===========================================================================
-- Migration 0018 — Exclusive promo codes / coupons hub
-- ---------------------------------------------------------------------------
-- Coupon cards shown in the public offers section. "Copy & go" copies the code
-- and opens the (tracked) referral link in a new tab.
-- ===========================================================================

create table if not exists public.coupons (
  id           uuid primary key default gen_random_uuid(),
  broker_id    uuid references public.brokers(id) on delete set null,
  broker_slug  text,
  broker_name  text,
  title        text not null,
  code         text not null,
  referral_url text,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists idx_coupons_active on public.coupons(is_active, created_at desc);

alter table public.coupons enable row level security;

drop policy if exists "coupons read active" on public.coupons;
create policy "coupons read active" on public.coupons
  for select using (is_active or public.is_admin());

drop policy if exists "coupons admin write" on public.coupons;
create policy "coupons admin write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());
