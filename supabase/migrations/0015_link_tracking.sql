-- ===========================================================================
-- Migration 0015 — Smart link cloaking + click tracking
-- ---------------------------------------------------------------------------
-- Each broker referral link gets a short branded code served at /go/<code>,
-- which logs the click (country, referrer) and redirects to the real URL.
-- ===========================================================================

alter table public.broker_links
  add column if not exists code text unique,
  add column if not exists clicks int not null default 0;

-- Backfill codes for existing links.
update public.broker_links
   set code = substr(md5(id::text), 1, 7)
 where code is null;

create table if not exists public.broker_link_clicks (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid references public.broker_links(id) on delete cascade,
  broker_id  uuid references public.brokers(id) on delete cascade,
  country    text,
  referer    text,
  created_at timestamptz not null default now()
);
create index if not exists idx_link_clicks_link on public.broker_link_clicks(link_id);
create index if not exists idx_link_clicks_broker on public.broker_link_clicks(broker_id, created_at desc);

-- Bump the denormalized counter on each click.
create or replace function public.trg_link_click()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.broker_links set clicks = clicks + 1 where id = new.link_id;
  return new;
end; $$;

drop trigger if exists t_link_click on public.broker_link_clicks;
create trigger t_link_click after insert on public.broker_link_clicks
  for each row execute function public.trg_link_click();

alter table public.broker_link_clicks enable row level security;

-- Clicks are written server-side (service role) and read only by admins.
drop policy if exists "clicks admin read" on public.broker_link_clicks;
create policy "clicks admin read" on public.broker_link_clicks
  for select using (public.is_admin());
