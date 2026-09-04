-- ===========================================================================
-- Migration 0017 — Broker utility fields (spread / leverage / bonus terms /
-- regulatory licenses) powering advanced filters, the spread matrix, and the
-- regulatory-status badges.
-- ===========================================================================

alter table public.brokers
  add column if not exists spread_from       numeric(5,2),   -- min raw spread (pips)
  add column if not exists leverage_max      text,           -- e.g. "1:2000"
  add column if not exists bonus_no_deposit  boolean not null default false,
  add column if not exists bonus_withdrawable boolean not null default false,
  add column if not exists supports_gold     boolean not null default false,
  add column if not exists licenses          text[] not null default '{}';
