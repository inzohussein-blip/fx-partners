-- ===========================================================================
-- Migration 0006 — Agent levels + automatic commission upgrade
-- ---------------------------------------------------------------------------
-- Recomputes an IB's tier and commission_rate from its referral count, and
-- upgrades automatically as referrals grow:
--   standard (<25) 40%  ·  silver (>=25) 50%  ·  gold (>=100) 55%  ·  vip (>=300) 60%
-- ===========================================================================

create or replace function public.recompute_ib_tier(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  new_tier text;
  new_rate numeric(5,2);
begin
  select count(*) into cnt from public.referrals where ib_id = target;

  if cnt >= 300 then new_tier := 'vip';      new_rate := 60;
  elsif cnt >= 100 then new_tier := 'gold';   new_rate := 55;
  elsif cnt >= 25  then new_tier := 'silver'; new_rate := 50;
  else new_tier := 'standard';                new_rate := 40;
  end if;

  update public.ib_accounts
     set tier = new_tier, commission_rate = new_rate, updated_at = now()
   where id = target and tier is distinct from new_tier;
end;
$$;

create or replace function public.trg_referral_tier()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_ib_tier(coalesce(new.ib_id, old.ib_id));
  return coalesce(new, old);
end; $$;

drop trigger if exists t_referral_tier on public.referrals;
create trigger t_referral_tier after insert or delete on public.referrals
  for each row execute function public.trg_referral_tier();
