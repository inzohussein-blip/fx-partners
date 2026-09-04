-- ===========================================================================
-- Migration 0009 — In-app announcements / changelog
-- ---------------------------------------------------------------------------
-- Admin-published updates (new features, promos, commission changes, news)
-- shown to partners as a notification bell + a timeline. Read state is kept
-- per-viewer in the browser (localStorage), so no per-user table is needed.
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

-- Everyone can read published announcements; admins see and manage all.
drop policy if exists "announcements read published" on public.announcements;
create policy "announcements read published" on public.announcements
  for select using (is_published or public.is_admin());

drop policy if exists "announcements admin write" on public.announcements;
create policy "announcements admin write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());
