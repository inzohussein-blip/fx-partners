-- ===========================================================================
-- FX Partners — Supabase / PostgreSQL Schema
-- ---------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- It is idempotent-ish: safe to run on a fresh project.
--
-- Security model:
--   * Every business table has Row Level Security (RLS) ENABLED.
--   * Partners can only read/write their OWN rows.
--   * Admins (profiles.role = 'admin') can manage everything.
--   * Financial mutations (earnings, withdrawals amounts) are NOT writable by
--     partners directly — they are produced by trusted server logic / triggers.
-- ===========================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";       -- gen_random_uuid()
create extension if not exists "uuid-ossp";

-- Enums ----------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('partner', 'ib', 'broker', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ib_status as enum ('pending', 'approved', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type earning_type as enum ('cpa', 'revenue_share', 'ib_commission', 'bonus', 'adjustment');
exception when duplicate_object then null; end $$;

do $$ begin
  create type withdrawal_status as enum ('pending', 'processing', 'paid', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- 1) PROFILES  (extends auth.users)
-- ===========================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  company_name  text,
  country       text,
  phone         text,
  avatar_url    text,
  role          user_role   not null default 'partner',
  telegram_chat_id    text,   -- linked Telegram chat for alerts
  telegram_link_token text,   -- one-time token used to link Telegram
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Public profile per authenticated user; role drives access.';

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- 2) IB_ACCOUNTS  (Introducing Broker / Affiliate business record)
-- ===========================================================================
create table if not exists public.ib_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  ib_code         text unique not null default ('IB' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  display_name    text,
  status          ib_status not null default 'pending',
  tier            text default 'standard',        -- standard | silver | gold | vip
  commission_rate numeric(5,2) not null default 40.00,  -- % revenue share
  cpa_amount      numeric(12,2) not null default 0,      -- fixed $ per qualified client
  parent_ib_id    uuid references public.ib_accounts(id) on delete set null, -- sub-IB / multi-tier
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_ib_accounts_user on public.ib_accounts(user_id);
create index if not exists idx_ib_accounts_parent on public.ib_accounts(parent_ib_id);

-- ===========================================================================
-- 3) REFERRAL_LINKS
-- ===========================================================================
create table if not exists public.referral_links (
  id           uuid primary key default gen_random_uuid(),
  ib_id        uuid not null references public.ib_accounts(id) on delete cascade,
  slug         text unique not null,               -- short code used in ?ref=slug
  campaign     text,                               -- e.g. "facebook-q1"
  target_url   text not null default '/',          -- landing page the link points to
  clicks       integer not null default 0,
  signups      integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_referral_links_ib on public.referral_links(ib_id);
create index if not exists idx_referral_links_slug on public.referral_links(slug);

-- ===========================================================================
-- 4) REFERRALS  (a client that signed up under an IB)
-- ===========================================================================
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  ib_id          uuid not null references public.ib_accounts(id) on delete cascade,
  link_id        uuid references public.referral_links(id) on delete set null,
  client_ref     text,                             -- external trading-account id
  client_email   text,
  status         text not null default 'lead',     -- lead | registered | funded | active
  trading_volume numeric(16,2) not null default 0, -- lots or notional volume
  created_at     timestamptz not null default now()
);

create index if not exists idx_referrals_ib on public.referrals(ib_id);

-- ===========================================================================
-- 5) EARNINGS  (commission ledger — append-only, written by server logic)
-- ===========================================================================
create table if not exists public.earnings (
  id           uuid primary key default gen_random_uuid(),
  ib_id        uuid not null references public.ib_accounts(id) on delete cascade,
  referral_id  uuid references public.referrals(id) on delete set null,
  type         earning_type not null default 'revenue_share',
  amount       numeric(14,2) not null,
  currency     text not null default 'USD',
  description  text,
  earned_at    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_earnings_ib on public.earnings(ib_id);
create index if not exists idx_earnings_earned_at on public.earnings(earned_at);

-- ===========================================================================
-- 6) WALLETS  (one balance row per IB — updated by triggers)
-- ===========================================================================
create table if not exists public.wallets (
  ib_id            uuid primary key references public.ib_accounts(id) on delete cascade,
  balance          numeric(14,2) not null default 0,  -- available to withdraw
  pending_balance  numeric(14,2) not null default 0,  -- earned, not yet cleared
  total_earned     numeric(14,2) not null default 0,
  total_withdrawn  numeric(14,2) not null default 0,
  currency         text not null default 'USD',
  updated_at       timestamptz not null default now()
);

-- ===========================================================================
-- 7) WITHDRAWALS
-- ===========================================================================
create table if not exists public.withdrawals (
  id            uuid primary key default gen_random_uuid(),
  ib_id         uuid not null references public.ib_accounts(id) on delete cascade,
  amount        numeric(14,2) not null check (amount > 0),
  currency      text not null default 'USD',
  method        text not null default 'bank_transfer', -- bank_transfer | crypto | ewallet
  destination   jsonb,                                 -- masked payout details
  status        withdrawal_status not null default 'pending',
  notes         text,
  requested_at  timestamptz not null default now(),
  processed_at  timestamptz
);

create index if not exists idx_withdrawals_ib on public.withdrawals(ib_id);

-- ===========================================================================
-- 8) POSTS  (editable blog / news — the dynamic CMS content)
-- ===========================================================================
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  body          text,                    -- markdown or HTML
  cover_image   text,
  status        post_status not null default 'draft',
  author_id     uuid references public.profiles(id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_posts_status on public.posts(status);

-- ===========================================================================
-- 9) SITE_CONTENT  (editable page text — key/value JSON blocks)
--    Lets you change headlines, commission numbers, partner logos, etc.
--    without code deploys.
-- ===========================================================================
create table if not exists public.site_content (
  key         text primary key,          -- e.g. 'home.hero', 'affiliates.rates'
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ===========================================================================
-- 10) PARTNERS  (broker / B2B partner logos + descriptions shown on the site)
-- ===========================================================================
create table if not exists public.partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website     text,
  description text,
  category    text default 'broker',     -- broker | technology | liquidity
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- TRIGGERS — keep updated_at fresh + roll earnings into the wallet
-- ===========================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists t_profiles_touch on public.profiles;
create trigger t_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists t_posts_touch on public.posts;
create trigger t_posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- When a new earning is inserted, ensure a wallet exists and accumulate totals.
create or replace function public.apply_earning_to_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wallets (ib_id, balance, total_earned)
  values (new.ib_id, new.amount, new.amount)
  on conflict (ib_id) do update
    set balance      = public.wallets.balance + new.amount,
        total_earned = public.wallets.total_earned + new.amount,
        updated_at   = now();
  return new;
end; $$;

drop trigger if exists t_earnings_wallet on public.earnings;
create trigger t_earnings_wallet after insert on public.earnings
  for each row execute function public.apply_earning_to_wallet();

-- When an admin marks a withdrawal as `paid`, deduct it from the wallet
-- balance and add it to total_withdrawn. Also stamp processed_at on any
-- status change away from `pending`.
create or replace function public.apply_withdrawal_to_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and coalesce(old.status::text, '') is distinct from 'paid' then
    update public.wallets
      set balance         = public.wallets.balance - new.amount,
          total_withdrawn = public.wallets.total_withdrawn + new.amount,
          updated_at      = now()
      where public.wallets.ib_id = new.ib_id;
  end if;

  if new.status <> 'pending' and new.processed_at is null then
    new.processed_at := now();
  end if;

  return new;
end; $$;

drop trigger if exists t_withdrawal_wallet on public.withdrawals;
create trigger t_withdrawal_wallet before update on public.withdrawals
  for each row execute function public.apply_withdrawal_to_wallet();

-- ===========================================================================
-- REFERRAL TRACKING  (callable by anonymous visitors via RPC)
-- ---------------------------------------------------------------------------
-- Visitors are not authenticated and RLS forbids them writing referral_links,
-- so these SECURITY DEFINER functions perform the counter updates safely and
-- expose ONLY what the redirect / attribution needs.
-- ===========================================================================

-- Increment a link's click counter; return where to redirect (null if unknown).
create or replace function public.track_referral_click(link_slug text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  dest text;
begin
  update public.referral_links
     set clicks = clicks + 1
     where slug = link_slug and is_active = true
     returning target_url into dest;
  return dest;
end; $$;

-- Attribute a signup to a link: bump signups + record a referral row.
create or replace function public.attribute_referral(link_slug text, client_email text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_link uuid;
  v_ib   uuid;
begin
  select id, ib_id into v_link, v_ib
    from public.referral_links
    where slug = link_slug and is_active = true;
  if v_ib is null then return; end if;

  update public.referral_links set signups = signups + 1 where id = v_link;

  insert into public.referrals (ib_id, link_id, client_email, status)
  values (v_ib, v_link, client_email, 'registered');
end; $$;

grant execute on function public.track_referral_click(text) to anon, authenticated;
grant execute on function public.attribute_referral(text, text) to anon, authenticated;

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles       enable row level security;
alter table public.ib_accounts     enable row level security;
alter table public.referral_links  enable row level security;
alter table public.referrals       enable row level security;
alter table public.earnings        enable row level security;
alter table public.wallets         enable row level security;
alter table public.withdrawals     enable row level security;
alter table public.posts           enable row level security;
alter table public.site_content    enable row level security;
alter table public.partners        enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Helper: does the current user own this IB account?
create or replace function public.owns_ib(target_ib uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.ib_accounts a
    where a.id = target_ib and a.user_id = auth.uid()
  );
$$;

-- ---- profiles ----
drop policy if exists "profiles self read"  on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- ib_accounts ----
drop policy if exists "ib read own" on public.ib_accounts;
create policy "ib read own" on public.ib_accounts
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ib insert own" on public.ib_accounts;
create policy "ib insert own" on public.ib_accounts
  for insert with check (user_id = auth.uid());

drop policy if exists "ib update admin" on public.ib_accounts;
create policy "ib update admin" on public.ib_accounts
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- referral_links (partners fully manage their own) ----
drop policy if exists "links read own" on public.referral_links;
create policy "links read own" on public.referral_links
  for select using (public.owns_ib(ib_id) or public.is_admin());

drop policy if exists "links write own" on public.referral_links;
create policy "links write own" on public.referral_links
  for all using (public.owns_ib(ib_id)) with check (public.owns_ib(ib_id));

-- ---- referrals (read-only for partners) ----
drop policy if exists "referrals read own" on public.referrals;
create policy "referrals read own" on public.referrals
  for select using (public.owns_ib(ib_id) or public.is_admin());

-- ---- earnings (read-only for partners; writes via service role/trigger) ----
drop policy if exists "earnings read own" on public.earnings;
create policy "earnings read own" on public.earnings
  for select using (public.owns_ib(ib_id) or public.is_admin());

-- ---- wallets (read-only for partners) ----
drop policy if exists "wallet read own" on public.wallets;
create policy "wallet read own" on public.wallets
  for select using (public.owns_ib(ib_id) or public.is_admin());

-- ---- withdrawals (partner may request + read own; status changes = admin) ----
drop policy if exists "wd read own" on public.withdrawals;
create policy "wd read own" on public.withdrawals
  for select using (public.owns_ib(ib_id) or public.is_admin());

drop policy if exists "wd request own" on public.withdrawals;
create policy "wd request own" on public.withdrawals
  for insert with check (public.owns_ib(ib_id) and status = 'pending');

drop policy if exists "wd update admin" on public.withdrawals;
create policy "wd update admin" on public.withdrawals
  for update using (public.is_admin()) with check (public.is_admin());

-- ---- posts (public reads published; admins manage) ----
drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- site_content (public read; admin write) ----
drop policy if exists "content public read" on public.site_content;
create policy "content public read" on public.site_content
  for select using (true);

drop policy if exists "content admin write" on public.site_content;
create policy "content admin write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- partners (public read active; admin write) ----
drop policy if exists "partners public read" on public.partners;
create policy "partners public read" on public.partners
  for select using (is_active or public.is_admin());

drop policy if exists "partners admin write" on public.partners;
create policy "partners admin write" on public.partners
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- AGREEMENTS  (partnership agreement e-signatures)
-- ===========================================================================
create table if not exists public.agreements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  ib_id       uuid references public.ib_accounts(id) on delete set null,
  version     text not null default 'v1',
  signer_name text,
  pdf_path    text,
  signed_at   timestamptz not null default now()
);
create index if not exists idx_agreements_user on public.agreements(user_id);

alter table public.agreements enable row level security;

drop policy if exists "agreements read own" on public.agreements;
create policy "agreements read own" on public.agreements
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "agreements insert own" on public.agreements;
create policy "agreements insert own" on public.agreements
  for insert with check (user_id = auth.uid());

-- ===========================================================================
-- AGENT LEVELS  (automatic commission tier upgrade — mirrors migration 0006)
-- ---------------------------------------------------------------------------
-- Recomputes an IB's tier + commission_rate from its referral count:
--   standard (<25) 40%  ·  silver (>=25) 50%  ·  gold (>=100) 55%  ·  vip (>=300) 60%
-- ===========================================================================
create or replace function public.recompute_ib_tier(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  new_tier text;
  new_rate numeric(5,2);
begin
  select count(*) into cnt from public.referrals where ib_id = target;

  if cnt >= 300 then new_tier := 'vip';      new_rate := 60;
  elsif cnt >= 100 then new_tier := 'gold';   new_rate := 55;
  elsif cnt >= 25  then new_tier := 'silver'; new_rate := 50;
  else new_tier := 'standard';                new_rate := 40;
  end if;

  update public.ib_accounts
     set tier = new_tier, commission_rate = new_rate, updated_at = now()
   where id = target and tier is distinct from new_tier;
end;
$$;

create or replace function public.trg_referral_tier()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_ib_tier(coalesce(new.ib_id, old.ib_id));
  return coalesce(new, old);
end; $$;

drop trigger if exists t_referral_tier on public.referrals;
create trigger t_referral_tier after insert or delete on public.referrals
  for each row execute function public.trg_referral_tier();

-- ===========================================================================
-- LEADERBOARD  (top agents, anonymized by IB code — mirrors migration 0007)
-- ---------------------------------------------------------------------------
-- Security-definer aggregation so RLS-protected wallets can be ranked without
-- exposing names, emails, user_ids, or exact balances.
-- ===========================================================================
create or replace function public.leaderboard(limit_n int default 10)
returns table (
  rank        int,
  masked_code text,
  tier        text,
  referrals   bigint,
  total_earned numeric,
  is_me       boolean
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      ib.id,
      ib.ib_code,
      coalesce(ib.tier, 'standard')                    as tier,
      ib.user_id,
      coalesce(w.total_earned, 0)                       as total_earned,
      (select count(*) from public.referrals r where r.ib_id = ib.id) as referrals
    from public.ib_accounts ib
    left join public.wallets w on w.ib_id = ib.id
    where ib.status = 'approved'
  )
  select
    (row_number() over (order by total_earned desc, referrals desc, ib_code))::int as rank,
    left(ib_code, 2) || '••••' || right(ib_code, 2)     as masked_code,
    tier,
    referrals,
    round(total_earned / 100.0) * 100                   as total_earned,
    (user_id = auth.uid())                              as is_me
  from ranked
  order by total_earned desc, referrals desc, masked_code
  limit greatest(1, least(coalesce(limit_n, 10), 100));
$$;

grant execute on function public.leaderboard(int) to anon, authenticated;

-- ===========================================================================
-- MEETINGS  (B2B scheduling — mirrors migration 0008)
-- ===========================================================================
create table if not exists public.meeting_slots (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  duration_min int not null default 30,
  meeting_url text,
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
  meeting_type text,
  message      text,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
create index if not exists idx_bookings_created on public.bookings(created_at desc);

alter table public.meeting_slots enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "slots read open" on public.meeting_slots;
create policy "slots read open" on public.meeting_slots
  for select using (status = 'open' or public.is_admin());

drop policy if exists "slots admin write" on public.meeting_slots;
create policy "slots admin write" on public.meeting_slots
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bookings admin read" on public.bookings;
create policy "bookings admin read" on public.bookings
  for select using (public.is_admin());

drop policy if exists "bookings admin write" on public.bookings;
create policy "bookings admin write" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- ANNOUNCEMENTS  (in-app changelog — mirrors migration 0009)
-- ===========================================================================
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  category     text not null default 'news',  -- feature | promo | commission | news
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists idx_announcements_published
  on public.announcements(is_published, published_at desc);

alter table public.announcements enable row level security;

drop policy if exists "announcements read published" on public.announcements;
create policy "announcements read published" on public.announcements
  for select using (is_published or public.is_admin());

drop policy if exists "announcements admin write" on public.announcements;
create policy "announcements admin write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- BROKER DIRECTORY  (comparison engine — mirrors migration 0010)
-- ===========================================================================
do $$ begin
  create type broker_status as enum ('partnered', 'not_partnered');
exception when duplicate_object then null; end $$;

create table if not exists public.brokers (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  logo_url      text,
  status        broker_status not null default 'not_partnered',
  deposit_bonus text,
  welcome_bonus text,
  description   text,
  rating        numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  badges        text[] not null default '{}',
  is_published  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_brokers_published on public.brokers(is_published, sort_order);

create table if not exists public.broker_links (
  id              uuid primary key default gen_random_uuid(),
  broker_id       uuid not null references public.brokers(id) on delete cascade,
  label           text,
  referral_url    text not null,
  agent_commission text,
  client_benefits  text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_broker_links_broker on public.broker_links(broker_id, sort_order);

create table if not exists public.broker_reviews (
  id             uuid primary key default gen_random_uuid(),
  broker_id      uuid not null references public.brokers(id) on delete cascade,
  user_id        uuid references public.profiles(id) on delete set null,
  user_name      text,
  comment        text not null,
  stars          int not null check (stars between 1 and 5),
  is_approved    boolean not null default false,
  is_admin_reply boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists idx_broker_reviews_broker on public.broker_reviews(broker_id, created_at desc);

create or replace function public.recompute_broker_rating(target uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  avg_stars numeric;
  cnt int;
begin
  select coalesce(avg(stars), 0), count(*) into avg_stars, cnt
  from public.broker_reviews
  where broker_id = target and is_approved = true;
  update public.brokers
     set rating = round(avg_stars, 2), reviews_count = cnt, updated_at = now()
   where id = target;
end; $$;

create or replace function public.trg_broker_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_broker_rating(coalesce(new.broker_id, old.broker_id));
  return coalesce(new, old);
end; $$;

drop trigger if exists t_broker_review on public.broker_reviews;
create trigger t_broker_review
  after insert or update or delete on public.broker_reviews
  for each row execute function public.trg_broker_review();

alter table public.brokers        enable row level security;
alter table public.broker_links   enable row level security;
alter table public.broker_reviews enable row level security;

drop policy if exists "brokers read" on public.brokers;
create policy "brokers read" on public.brokers
  for select using (is_published or public.is_admin());
drop policy if exists "brokers admin write" on public.brokers;
create policy "brokers admin write" on public.brokers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "broker_links read" on public.broker_links;
create policy "broker_links read" on public.broker_links
  for select using (true);
drop policy if exists "broker_links admin write" on public.broker_links;
create policy "broker_links admin write" on public.broker_links
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "broker_reviews read approved" on public.broker_reviews;
create policy "broker_reviews read approved" on public.broker_reviews
  for select using (is_approved or public.is_admin());
drop policy if exists "broker_reviews public insert" on public.broker_reviews;
create policy "broker_reviews public insert" on public.broker_reviews
  for insert with check (is_approved = false and is_admin_reply = false);
drop policy if exists "broker_reviews admin write" on public.broker_reviews;
create policy "broker_reviews admin write" on public.broker_reviews
  for all using (public.is_admin()) with check (public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.broker_reviews;
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- BROKER DISCUSSION BOARD  (threaded forum — mirrors migration 0011)
-- ===========================================================================
create table if not exists public.broker_posts (
  id         uuid primary key default gen_random_uuid(),
  broker_id  uuid not null references public.brokers(id) on delete cascade,
  parent_id  uuid references public.broker_posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  author_name text,
  body       text not null,
  is_staff   boolean not null default false,
  likes      int not null default 0,
  dislikes   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_broker_posts_broker on public.broker_posts(broker_id, created_at);
create index if not exists idx_broker_posts_parent on public.broker_posts(parent_id);

create table if not exists public.broker_post_votes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.broker_posts(id) on delete cascade,
  voter_key  text not null,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (post_id, voter_key)
);
create index if not exists idx_broker_post_votes_post on public.broker_post_votes(post_id);

create or replace function public.recompute_post_votes(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.broker_posts p
     set likes    = (select count(*) from public.broker_post_votes v
                      where v.post_id = target and v.value = 1),
         dislikes = (select count(*) from public.broker_post_votes v
                      where v.post_id = target and v.value = -1)
   where p.id = target;
end; $$;

create or replace function public.trg_post_vote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_post_votes(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end; $$;

drop trigger if exists t_post_vote on public.broker_post_votes;
create trigger t_post_vote
  after insert or update or delete on public.broker_post_votes
  for each row execute function public.trg_post_vote();

alter table public.broker_posts      enable row level security;
alter table public.broker_post_votes enable row level security;

drop policy if exists "board read" on public.broker_posts;
create policy "board read" on public.broker_posts for select using (true);
drop policy if exists "board public insert" on public.broker_posts;
create policy "board public insert" on public.broker_posts
  for insert with check (is_staff = false);
drop policy if exists "board admin write" on public.broker_posts;
create policy "board admin write" on public.broker_posts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "votes read" on public.broker_post_votes;
create policy "votes read" on public.broker_post_votes for select using (true);
drop policy if exists "votes public write" on public.broker_post_votes;
create policy "votes public write" on public.broker_post_votes
  for all using (true) with check (value in (-1, 1));

do $$ begin
  alter publication supabase_realtime add table public.broker_posts;
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- BROKER SUBSCRIPTIONS  (bonus/terms alerts — mirrors migration 0013)
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

drop policy if exists "subs public insert" on public.broker_subscriptions;
create policy "subs public insert" on public.broker_subscriptions
  for insert with check (email is not null);
drop policy if exists "subs admin read" on public.broker_subscriptions;
create policy "subs admin read" on public.broker_subscriptions
  for select using (public.is_admin());
drop policy if exists "subs admin write" on public.broker_subscriptions;
create policy "subs admin write" on public.broker_subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- SIGNALS  (trading recommendations + outbound broadcast — mirrors 0014)
-- ===========================================================================
create table if not exists public.signals (
  id           uuid primary key default gen_random_uuid(),
  broker_id    uuid references public.brokers(id) on delete set null,
  title        text not null,
  body         text not null,
  symbol       text,
  direction    text,
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

drop policy if exists "signals read" on public.signals;
create policy "signals read" on public.signals
  for select using (is_published or public.is_admin());
drop policy if exists "signals admin write" on public.signals;
create policy "signals admin write" on public.signals
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "webhooks admin all" on public.outbound_webhooks;
create policy "webhooks admin all" on public.outbound_webhooks
  for all using (public.is_admin()) with check (public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.signals;
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- DONE. Load supabase/seed.sql next for demo content.
-- ===========================================================================
