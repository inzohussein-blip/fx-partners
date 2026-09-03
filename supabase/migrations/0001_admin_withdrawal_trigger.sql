-- ===========================================================================
-- Migration 0001 — Withdrawal → Wallet trigger (for the admin approval flow)
-- ---------------------------------------------------------------------------
-- Run this ONLY if you already applied schema.sql before the admin page was
-- added. Fresh databases created from the current schema.sql already include
-- this trigger. Safe to run more than once.
-- ===========================================================================

create or replace function public.apply_withdrawal_to_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and coalesce(old.status::text, '') is distinct from 'paid' then
    update public.wallets
      set balance         = public.wallets.balance - new.amount,
          total_withdrawn = public.wallets.total_withdrawn + new.amount,
          updated_at      = now()
      where public.wallets.ib_id = new.ib_id;
  end if;

  if new.status <> 'pending' and new.processed_at is null then
    new.processed_at := now();
  end if;

  return new;
end; $$;

drop trigger if exists t_withdrawal_wallet on public.withdrawals;
create trigger t_withdrawal_wallet before update on public.withdrawals
  for each row execute function public.apply_withdrawal_to_wallet();
