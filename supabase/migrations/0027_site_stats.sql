-- ---------------------------------------------------------------------------
-- إحصاءات الموقع العامة — أرقام حقيقية بدل أرقام مكتوبة يدوياً
--
-- Public site statistics.
--
-- The marketing pages used to render figures written by hand into the message
-- catalogue: "2,400+ active agents", "40+ partner brokers", "60+ countries",
-- "$18B+ volume", "$4.6M+ paid to agents". None of them came from anywhere.
-- On a site about financial services, invented business metrics are a
-- misleading-advertising problem, not a copywriting one.
--
-- This function is the only source those figures may come from now. It returns
-- counts and nothing else — no rows, no identifiers, no amounts — so it can be
-- granted to anonymous visitors without exposing the tables it reads. The
-- caller decides what to do with a small number; the honest answer to "how
-- many agents" when there are three is to say three, or to say nothing.
-- ---------------------------------------------------------------------------

create or replace function public.site_stats()
returns table (
  brokers   bigint,
  agents    bigint,
  countries bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.brokers where is_published = true)            as brokers,
    (select count(*) from public.ib_accounts where status = 'approved')        as agents,
    (
      -- Countries we have actually seen a click from. Coarse by construction:
      -- the click tables store a country code and never an IP address.
      select count(distinct country) from (
        select country from public.referral_link_clicks where country is not null
        union all
        select country from public.broker_link_clicks   where country is not null
      ) c
    )                                                                          as countries;
$$;

comment on function public.site_stats() is
  'Aggregate public counts for the marketing pages. Returns counts only — never rows — so it is safe to expose to anon.';

grant execute on function public.site_stats() to anon, authenticated;
