-- ---------------------------------------------------------------------------
-- منصّات التداول والدول المقبولة — عمودان يحتاجهما المرشّح الموجّه
--
-- Two columns the guided finder needs and the schema did not have.
--
-- `platforms` is a plain fact about a broker and cheap to keep current:
-- MT4, MT5, cTrader, TradingView or the broker's own platform. It is one of
-- the first things a trader filters on and we had no way to answer it.
--
-- `accepted_countries` is deliberately more cautious. Which countries a broker
-- onboards is real, it matters enormously to an Arabic-speaking audience, and
-- it is also volatile and a statement with consequences: telling someone a
-- broker accepts them when it does not wastes their time at best. So the
-- column exists, it starts empty, the finder only offers the filter once
-- brokers actually carry the data, and the result always says that acceptance
-- is confirmed by the broker at signup and not by us.
--
-- ISO 3166-1 alpha-2, uppercase. An empty array means "we have not verified
-- this", never "accepts everyone" — the finder treats the two differently.
-- ---------------------------------------------------------------------------

alter table public.brokers
  add column if not exists platforms          text[] not null default '{}',
  add column if not exists accepted_countries text[] not null default '{}';

comment on column public.brokers.platforms is
  'Trading platforms offered: mt4, mt5, ctrader, tradingview, proprietary.';
comment on column public.brokers.accepted_countries is
  'ISO 3166-1 alpha-2 codes we have verified the broker onboards. Empty means unverified, not unrestricted.';

-- Membership tests on these run on every finder query.
create index if not exists idx_brokers_platforms
  on public.brokers using gin (platforms);
create index if not exists idx_brokers_accepted_countries
  on public.brokers using gin (accepted_countries);
