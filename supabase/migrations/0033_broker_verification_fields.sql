-- ===========================================================================
-- 0033 — verification fields, and tri-state feature flags
-- ===========================================================================
-- Two things the manual verification sheet needs to round-trip into the site:
--
-- 1) Where a broker's facts were verified. The sheet collects the legal
--    entity, the licence numbers, a link to the regulator's own register entry
--    and the broker's official site. None of that had a column, so it could be
--    gathered but never published.
--
-- 2) "No" as distinct from "unknown". The seven feature flags were
--    `boolean not null default false`, so a broker nobody had checked and a
--    broker checked and found not to offer (say) an Islamic account were the
--    same row. The site had to show both as a dash. The flags become nullable:
--    true = offered, false = checked and not offered, null = not checked.
--    Every existing false is a default (no broker has a single flag set), so
--    they all become null.
-- ===========================================================================

alter table public.brokers add column if not exists legal_entity        text;
alter table public.brokers add column if not exists licence_numbers     text;
alter table public.brokers add column if not exists verification_url    text;
alter table public.brokers add column if not exists official_website    text;
alter table public.brokers add column if not exists verification_status text;
alter table public.brokers add column if not exists verified_at         date;

do $$ begin
  alter table public.brokers
    add constraint brokers_verification_status_check
    check (verification_status in ('verified', 'partial', 'unverified', 'in_review', 'rejected'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.brokers
    add constraint brokers_verification_url_http
    check (verification_url is null or verification_url ~* '^https?://');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.brokers
    add constraint brokers_official_website_http
    check (official_website is null or official_website ~* '^https?://');
exception when duplicate_object then null; end $$;

-- Tri-state feature flags.
do $$
declare col text;
begin
  foreach col in array array[
    'supports_ea', 'allows_hedging', 'swap_free', 'allows_scalping',
    'supports_gold', 'bonus_no_deposit', 'bonus_withdrawable'
  ] loop
    execute format('alter table public.brokers alter column %I drop not null', col);
    execute format('alter table public.brokers alter column %I set default null', col);
    execute format('update public.brokers set %I = null where %I = false', col, col);
  end loop;
end $$;

-- What is already documented for the original brokers (supabase/seed.sql,
-- each number checked against the regulator's register). Only fills blanks.
update public.brokers b set
  legal_entity        = coalesce(b.legal_entity, v.entity),
  licence_numbers     = coalesce(b.licence_numbers, v.numbers),
  official_website    = coalesce(b.official_website, v.site),
  verification_status = coalesce(b.verification_status, 'partial')
from (values
  ('oneroyal', 'Royal Financial Trading Pty Ltd (ASIC)؛ Royal Financial Trading (CY) Ltd (CySEC)',
               'ASIC: AFSL 420268؛ CySEC: 312/16', 'https://www.oneroyal.com'),
  ('vantage',  'Vantage Global Prime LLP (FCA)؛ Vantage Global Prime Pty Ltd (ASIC)؛ Vantage Markets Pty Ltd (FSCA)',
               'FCA: OC376560؛ ASIC: AFSL 428901؛ FSCA: FSP 51268', 'https://www.vantagemarkets.com'),
  ('xm',       'Trading Point of Financial Instruments Ltd (CySEC)؛ Trading Point of Financial Instruments Pty Ltd (ASIC)؛ Trading Point MENA Limited (DFSA)',
               'CySEC: 120/10؛ ASIC: AFSL 443670؛ DFSA: F003484', 'https://www.xm.com'),
  ('inzo',     'INZO Group LTD (FSA سيشل)', 'FSA: SD163', 'https://inzo.co'),
  ('tnfx',     'TNFX Ltd (FSA سيشل)', 'FSA: SD133', 'https://tnfx.co')
) as v(slug, entity, numbers, site)
where b.slug = v.slug;

update public.brokers set verification_status = 'in_review'
where slug = 'altima' and verification_status is null;

comment on column public.brokers.verification_status is
  'verified | partial | unverified | in_review | rejected — set from the manual verification sheet.';
comment on column public.brokers.swap_free is
  'true = offered, false = checked and not offered, null = not checked. Same for the other feature flags.';
