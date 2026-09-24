-- ===========================================================================
-- 0030 — external dataset fields on brokers
-- ===========================================================================
-- A place to carry third-party data (an external broker directory) WITHOUT it ever
-- being mistaken for our own verified facts. Kept in dedicated columns so the
-- UI can label it as external and our review-based `rating` / verified
-- `licenses` stay untouched:
--
--   external_score   the third party's own 0–10 score (never our star rating)
--   external_source  where it came from, e.g. 'directory'
--   external_wikifx  the full snapshot (renamed external_data in 0031) (country, model, platforms, tags, url)
--
-- Nothing here is treated as truth automatically; it is shown attributed to
-- its source. Deliberately NOT added: any mapping of a guessed regulator into
-- the verified `licenses` array.
-- ===========================================================================

alter table public.brokers add column if not exists external_score  numeric(3,1);
alter table public.brokers add column if not exists external_source text;
alter table public.brokers add column if not exists external_wikifx jsonb;

comment on column public.brokers.external_score is
  'Third-party score (0-10), shown attributed — never the site''s review rating.';
comment on column public.brokers.external_wikifx is
  'External directory snapshot; data, not verified truth.';
