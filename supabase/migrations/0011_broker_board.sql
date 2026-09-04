-- ===========================================================================
-- Migration 0011 — Broker discussion board (threaded, with votes)
-- ---------------------------------------------------------------------------
-- A per-broker mini-forum: self-referencing posts (parent_id) for branched
-- replies, like/dislike votes with denormalized counts, and full admin
-- moderation. Posts appear immediately (engagement first); admins delete
-- abusive ones. Realtime keeps open boards live.
-- Note: the column is named `is_staff` to avoid confusion with the
-- `public.is_admin()` RLS helper.
-- ===========================================================================

create table if not exists public.broker_posts (
  id         uuid primary key default gen_random_uuid(),
  broker_id  uuid not null references public.brokers(id) on delete cascade,
  parent_id  uuid references public.broker_posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  author_name text,
  body       text not null,
  is_staff   boolean not null default false,   -- authored by the FX Partners team
  likes      int not null default 0,           -- denormalized from votes
  dislikes   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_broker_posts_broker on public.broker_posts(broker_id, created_at);
create index if not exists idx_broker_posts_parent on public.broker_posts(parent_id);

create table if not exists public.broker_post_votes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.broker_posts(id) on delete cascade,
  voter_key  text not null,                    -- user id or guest browser key
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (post_id, voter_key)
);
create index if not exists idx_broker_post_votes_post on public.broker_post_votes(post_id);

-- Denormalized like/dislike counts, recomputed on any vote change ------------
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

-- RLS ------------------------------------------------------------------------
alter table public.broker_posts      enable row level security;
alter table public.broker_post_votes enable row level security;

-- Posts: everyone reads; anyone may post (forced non-staff); admin manages all.
drop policy if exists "board read" on public.broker_posts;
create policy "board read" on public.broker_posts
  for select using (true);

drop policy if exists "board public insert" on public.broker_posts;
create policy "board public insert" on public.broker_posts
  for insert with check (is_staff = false);

drop policy if exists "board admin write" on public.broker_posts;
create policy "board admin write" on public.broker_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Votes: readable by all; toggled by anyone (affects only counts).
drop policy if exists "votes read" on public.broker_post_votes;
create policy "votes read" on public.broker_post_votes
  for select using (true);

drop policy if exists "votes public write" on public.broker_post_votes;
create policy "votes public write" on public.broker_post_votes
  for all using (true) with check (value in (-1, 1));

-- Realtime for live threads.
do $$ begin
  alter publication supabase_realtime add table public.broker_posts;
exception when duplicate_object then null; end $$;
