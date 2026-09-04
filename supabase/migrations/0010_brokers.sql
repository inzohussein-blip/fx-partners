-- ===========================================================================
-- Migration 0010 — Broker directory & comparison engine
-- ---------------------------------------------------------------------------
-- Client-facing directory of trading companies with multiple referral links,
-- star reviews with admin moderation, and a denormalized rating. Fully
-- Supabase-native: public review submissions are forced into moderation by an
-- RLS CHECK; approvals/deletes flow live via Realtime.
-- ===========================================================================

do $$ begin
  create type broker_status as enum ('partnered', 'not_partnered');
exception when duplicate_object then null; end $$;

-- 1) BROKERS -----------------------------------------------------------------
create table if not exists public.brokers (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  logo_url      text,
  status        broker_status not null default 'not_partnered',
  deposit_bonus text,                       -- e.g. "100%"
  welcome_bonus text,                       -- e.g. "$50"
  description   text,                       -- full detail-page copy
  rating        numeric(3,2) not null default 0,  -- avg approved stars (denormalized)
  reviews_count int not null default 0,     -- approved reviews (denormalized)
  is_published  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_brokers_published on public.brokers(is_published, sort_order);

-- 2) BROKER_LINKS  (multiple referral links per broker) ----------------------
create table if not exists public.broker_links (
  id              uuid primary key default gen_random_uuid(),
  broker_id       uuid not null references public.brokers(id) on delete cascade,
  label           text,
  referral_url    text not null,
  agent_commission text,                    -- "5$ لكل لوت"
  client_benefits  text,                    -- "سبريد مخفض 0.0"
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_broker_links_broker on public.broker_links(broker_id, sort_order);

-- 3) BROKER_REVIEWS  (stars + comments, moderated) ---------------------------
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

-- Denormalized rating: recompute from APPROVED reviews on any change ----------
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

-- RLS ------------------------------------------------------------------------
alter table public.brokers        enable row level security;
alter table public.broker_links   enable row level security;
alter table public.broker_reviews enable row level security;

-- Brokers: public reads published; admin manages all.
drop policy if exists "brokers read" on public.brokers;
create policy "brokers read" on public.brokers
  for select using (is_published or public.is_admin());
drop policy if exists "brokers admin write" on public.brokers;
create policy "brokers admin write" on public.brokers
  for all using (public.is_admin()) with check (public.is_admin());

-- Links: readable by all (public directory); admin manages.
drop policy if exists "broker_links read" on public.broker_links;
create policy "broker_links read" on public.broker_links
  for select using (true);
drop policy if exists "broker_links admin write" on public.broker_links;
create policy "broker_links admin write" on public.broker_links
  for all using (public.is_admin()) with check (public.is_admin());

-- Reviews: public reads only APPROVED; anyone may submit, but the submission
-- is forced into moderation (cannot self-approve or fake an admin reply).
drop policy if exists "broker_reviews read approved" on public.broker_reviews;
create policy "broker_reviews read approved" on public.broker_reviews
  for select using (is_approved or public.is_admin());

drop policy if exists "broker_reviews public insert" on public.broker_reviews;
create policy "broker_reviews public insert" on public.broker_reviews
  for insert with check (is_approved = false and is_admin_reply = false);

drop policy if exists "broker_reviews admin write" on public.broker_reviews;
create policy "broker_reviews admin write" on public.broker_reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- Realtime: stream approvals/deletes to open broker pages.
do $$ begin
  alter publication supabase_realtime add table public.broker_reviews;
exception when duplicate_object then null; end $$;
