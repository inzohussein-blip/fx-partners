-- ===========================================================================
-- Migration 0007 — Public leaderboard (top agents, anonymized by IB code)
-- ---------------------------------------------------------------------------
-- RLS keeps each IB's wallet/earnings private, so a plain client query cannot
-- rank across agents. This security-definer function aggregates server-side
-- and returns ONLY anonymized, non-identifying columns:
--   masked IB code · tier · referral count · total earned (rounded) · is_me
-- No names, emails, user_ids or exact wallet rows ever leave the function.
-- ===========================================================================

create or replace function public.leaderboard(limit_n int default 10)
returns table (
  rank        int,
  masked_code text,
  tier        text,
  referrals   bigint,
  total_earned numeric,
  is_me       boolean
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      ib.id,
      ib.ib_code,
      coalesce(ib.tier, 'standard')                    as tier,
      ib.user_id,
      coalesce(w.total_earned, 0)                       as total_earned,
      (select count(*) from public.referrals r where r.ib_id = ib.id) as referrals
    from public.ib_accounts ib
    left join public.wallets w on w.ib_id = ib.id
    where ib.status = 'approved'
  )
  select
    (row_number() over (order by total_earned desc, referrals desc, ib_code))::int as rank,
    -- keep the "IB" prefix + last 2 chars, mask the middle
    left(ib_code, 2) || '••••' || right(ib_code, 2)     as masked_code,
    tier,
    referrals,
    -- round to the nearest $100 so exact balances are never exposed
    round(total_earned / 100.0) * 100                   as total_earned,
    (user_id = auth.uid())                              as is_me
  from ranked
  order by total_earned desc, referrals desc, masked_code
  limit greatest(1, least(coalesce(limit_n, 10), 100));
$$;

grant execute on function public.leaderboard(int) to anon, authenticated;
