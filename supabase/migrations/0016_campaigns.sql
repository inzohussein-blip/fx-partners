-- ===========================================================================
-- Migration 0016 — Live broker campaigns ("القنّاص المالي")
-- ---------------------------------------------------------------------------
-- Admin publishes a limited-time offer; a Realtime INSERT pushes an animated
-- banner to every visitor on the site instantly (no refresh), and the offer
-- shows in the public offers section.
-- ===========================================================================

create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  broker_id   uuid references public.brokers(id) on delete set null,
  broker_slug text,
  title       text not null,
  message     text not null,
  cta_label   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_campaigns_active on public.campaigns(is_active, created_at desc);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns read active" on public.campaigns;
create policy "campaigns read active" on public.campaigns
  for select using (is_active or public.is_admin());

drop policy if exists "campaigns admin write" on public.campaigns;
create policy "campaigns admin write" on public.campaigns
  for all using (public.is_admin()) with check (public.is_admin());

do $$ begin
  alter publication supabase_realtime add table public.campaigns;
exception when duplicate_object then null; end $$;
