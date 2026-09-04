-- ===========================================================================
-- Migration 0005 — Partnership agreement e-signatures
-- ---------------------------------------------------------------------------
-- Stores a record of each signed partnership agreement. The signed PDF lives
-- in the private Storage bucket `agreements` (created automatically on first
-- sign, or manually: Storage → New bucket → "agreements", private).
-- ===========================================================================

create table if not exists public.agreements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  ib_id       uuid references public.ib_accounts(id) on delete set null,
  version     text not null default 'v1',
  signer_name text,
  pdf_path    text,                 -- object path inside the `agreements` bucket
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
