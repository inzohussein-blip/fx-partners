-- ===========================================================================
-- 0031 — rename external_wikifx → external_data
-- ===========================================================================
-- The external-dataset column is not tied to any one source. It is renamed to
-- a neutral name before any row uses it (0030 created it empty), so no data
-- moves. Guarded so it is a no-op if already renamed.
-- ===========================================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'brokers' and column_name = 'external_wikifx'
  ) then
    alter table public.brokers rename column external_wikifx to external_data;
  end if;
end $$;

comment on column public.brokers.external_data is
  'External directory snapshot (regulation, leverage, min deposit, HQ, website). Data shown attributed, not verified truth.';
