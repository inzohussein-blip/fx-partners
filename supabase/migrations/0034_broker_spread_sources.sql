-- ===========================================================================
-- 0034 — where each spread figure comes from
-- ===========================================================================
-- broker_spreads held a bare number. The /spreads page showed it under
-- "best spread right now", as if it were live, with no account type, no
-- source and no date. A spread differs by account (standard vs raw + fee) and
-- moves every day, so a figure without those is not comparable and cannot be
-- checked. These columns let every cell say what it is and where it was read.
-- Existing rows keep working; the page shows "source not recorded" for them.
-- ===========================================================================

alter table public.broker_spreads add column if not exists account_type text;
alter table public.broker_spreads add column if not exists source_url  text;
alter table public.broker_spreads add column if not exists source_note text;

do $$ begin
  alter table public.broker_spreads
    add constraint broker_spreads_source_url_http
    check (source_url is null or source_url ~* '^https?://');
exception when duplicate_object then null; end $$;

comment on column public.broker_spreads.spread is
  'Typical spread in pips as published by the broker (not live), for account_type.';
comment on column public.broker_spreads.account_type is
  'Account the figure applies to, e.g. Standard, Raw (+ commission).';
comment on column public.broker_spreads.source_url is
  'Page on the broker''s own site where the figure was read.';
comment on column public.broker_spreads.source_note is
  'Free-text provenance, e.g. "average spread table, checked by the team".';
