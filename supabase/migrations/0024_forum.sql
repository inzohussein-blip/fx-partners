-- ===========================================================================
-- Migration 0024 — Trading Forum & Social Channels Hub
-- ---------------------------------------------------------------------------
-- A community layer for FX Partners:
--   * forum_channels — official (admin) news channels + per-agent (IB) channels
--   * forum_posts     — news / analysis authored inside a channel
--   * forum_comments  — threaded (nested) client discussion under each post
--   * forum_reactions — lightweight likes on posts and comments
--
-- Fully Supabase-native (RLS-governed, no external forum server).
--
-- Author display fields (author_name / author_avatar / owner_name) are
-- DENORMALIZED onto the rows because public.profiles is only readable by its
-- owner or an admin — anonymous forum visitors must still see who wrote a post
-- without exposing the whole profiles table. They are stamped at write time by
-- the server actions.
-- ===========================================================================

-- 1) CHANNELS ---------------------------------------------------------------
create table if not exists public.forum_channels (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  cover_image   text,
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  owner_name    text,                                    -- denormalized
  kind          text not null default 'agent'
                  check (kind in ('official', 'agent')),
  status        text not null default 'pending'
                  check (status in ('active', 'pending', 'banned')),
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists forum_channels_status_idx
  on public.forum_channels(status, sort_order);
create index if not exists forum_channels_owner_idx
  on public.forum_channels(owner_id);

-- 2) POSTS ------------------------------------------------------------------
create table if not exists public.forum_posts (
  id            uuid primary key default gen_random_uuid(),
  channel_id    uuid not null references public.forum_channels(id) on delete cascade,
  author_id     uuid not null references public.profiles(id) on delete cascade,
  author_name   text,                                    -- denormalized
  author_avatar text,                                    -- denormalized
  title         text not null,
  slug          text not null,
  excerpt       text,
  body          text,                                    -- rich HTML (TipTap)
  cover_image   text,
  status        text not null default 'published'
                  check (status in ('published', 'draft')),
  is_pinned     boolean not null default false,
  views         int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (channel_id, slug)
);
create index if not exists forum_posts_channel_idx
  on public.forum_posts(channel_id, is_pinned desc, created_at desc);
create index if not exists forum_posts_feed_idx
  on public.forum_posts(status, created_at desc);

-- 3) COMMENTS (threaded) ----------------------------------------------------
create table if not exists public.forum_comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.forum_posts(id) on delete cascade,
  parent_id     uuid references public.forum_comments(id) on delete cascade,
  author_id     uuid not null references public.profiles(id) on delete cascade,
  author_name   text,                                    -- denormalized
  author_avatar text,                                    -- denormalized
  body          text not null,
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists forum_comments_post_idx
  on public.forum_comments(post_id, created_at);

-- 4) REACTIONS (likes on a post OR a comment) -------------------------------
create table if not exists public.forum_reactions (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.forum_posts(id) on delete cascade,
  comment_id  uuid references public.forum_comments(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- exactly one target
  check ((post_id is not null)::int + (comment_id is not null)::int = 1)
);
-- one reaction per user per target
create unique index if not exists forum_reactions_post_uniq
  on public.forum_reactions(post_id, user_id) where post_id is not null;
create unique index if not exists forum_reactions_comment_uniq
  on public.forum_reactions(comment_id, user_id) where comment_id is not null;

-- ---------------------------------------------------------------------------
-- Helpers & triggers
-- ---------------------------------------------------------------------------

-- May the current user own a forum channel (admins + approved IBs)?
create or replace function public.can_create_channel()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('ib', 'admin')
  );
$$;

-- Does the current user own this channel?
create or replace function public.owns_forum_channel(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.forum_channels c
    where c.id = target and c.owner_id = auth.uid()
  );
$$;

-- touch updated_at
create or replace function public.forum_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists t_forum_channels_touch on public.forum_channels;
create trigger t_forum_channels_touch before update on public.forum_channels
  for each row execute function public.forum_touch_updated_at();

drop trigger if exists t_forum_posts_touch on public.forum_posts;
create trigger t_forum_posts_touch before update on public.forum_posts
  for each row execute function public.forum_touch_updated_at();

-- Only admins may change a channel's status (agents can't self-approve/unban).
create or replace function public.forum_guard_channel_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then
    raise exception 'only an admin can change channel status';
  end if;
  if new.kind is distinct from old.kind and not public.is_admin() then
    raise exception 'only an admin can change channel kind';
  end if;
  return new;
end; $$;

drop trigger if exists t_forum_channels_status_guard on public.forum_channels;
create trigger t_forum_channels_status_guard before update on public.forum_channels
  for each row execute function public.forum_guard_channel_status();

-- Atomic view counter.
create or replace function public.forum_increment_views(p_post uuid)
returns void language sql security definer set search_path = public as $$
  update public.forum_posts set views = views + 1 where id = p_post;
$$;
revoke all on function public.forum_increment_views(uuid) from public;
grant execute on function public.forum_increment_views(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.forum_channels  enable row level security;
alter table public.forum_posts     enable row level security;
alter table public.forum_comments  enable row level security;
alter table public.forum_reactions enable row level security;

-- ---- channels ----
drop policy if exists "forum_channels read" on public.forum_channels;
create policy "forum_channels read" on public.forum_channels
  for select using (
    status = 'active' or owner_id = auth.uid() or public.is_admin()
  );

drop policy if exists "forum_channels insert" on public.forum_channels;
create policy "forum_channels insert" on public.forum_channels
  for insert with check (
    owner_id = auth.uid()
    and public.can_create_channel()
    and (public.is_admin() or (kind = 'agent' and status = 'pending'))
  );

drop policy if exists "forum_channels update" on public.forum_channels;
create policy "forum_channels update" on public.forum_channels
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "forum_channels delete" on public.forum_channels;
create policy "forum_channels delete" on public.forum_channels
  for delete using (owner_id = auth.uid() or public.is_admin());

-- ---- posts ----
drop policy if exists "forum_posts read" on public.forum_posts;
create policy "forum_posts read" on public.forum_posts
  for select using (
    (
      status = 'published'
      and exists (
        select 1 from public.forum_channels c
        where c.id = channel_id and c.status = 'active'
      )
    )
    or author_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "forum_posts insert" on public.forum_posts;
create policy "forum_posts insert" on public.forum_posts
  for insert with check (
    author_id = auth.uid()
    and (
      public.is_admin()
      or exists (
        select 1 from public.forum_channels c
        where c.id = channel_id
          and c.owner_id = auth.uid()
          and c.status = 'active'
      )
    )
  );

drop policy if exists "forum_posts update" on public.forum_posts;
create policy "forum_posts update" on public.forum_posts
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "forum_posts delete" on public.forum_posts;
create policy "forum_posts delete" on public.forum_posts
  for delete using (author_id = auth.uid() or public.is_admin());

-- ---- comments ----
drop policy if exists "forum_comments read" on public.forum_comments;
create policy "forum_comments read" on public.forum_comments
  for select using (
    is_hidden = false or author_id = auth.uid() or public.is_admin()
  );

drop policy if exists "forum_comments insert" on public.forum_comments;
create policy "forum_comments insert" on public.forum_comments
  for insert with check (author_id = auth.uid());

-- Hiding is an admin action; users delete their own comment instead of editing.
drop policy if exists "forum_comments update" on public.forum_comments;
create policy "forum_comments update" on public.forum_comments
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "forum_comments delete" on public.forum_comments;
create policy "forum_comments delete" on public.forum_comments
  for delete using (author_id = auth.uid() or public.is_admin());

-- ---- reactions ----
drop policy if exists "forum_reactions read" on public.forum_reactions;
create policy "forum_reactions read" on public.forum_reactions
  for select using (true);

drop policy if exists "forum_reactions insert" on public.forum_reactions;
create policy "forum_reactions insert" on public.forum_reactions
  for insert with check (user_id = auth.uid());

drop policy if exists "forum_reactions delete" on public.forum_reactions;
create policy "forum_reactions delete" on public.forum_reactions
  for delete using (user_id = auth.uid());
