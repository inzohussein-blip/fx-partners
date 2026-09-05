-- ===========================================================================
-- Migration 0022 — Atomic reorder RPC
-- ---------------------------------------------------------------------------
-- The admin drag-and-drop reorder previously issued one UPDATE per row from the
-- server action (Promise.all). A failure partway through left rows with a
-- partial/inconsistent sort_order. This function persists the whole new order
-- in a single UPDATE statement — atomic within one transaction — so an order
-- either fully applies or not at all.
--
-- Safety: SECURITY DEFINER + an explicit is_admin() gate (matching the RLS
-- policies on these tables), and the target table is validated against a fixed
-- allowlist before any dynamic SQL, so p_table cannot be used for injection.
-- ===========================================================================

create or replace function public.reorder_records(p_table text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_table not in ('brokers', 'trading_resources', 'partners') then
    raise exception 'table not allowed: %', p_table;
  end if;

  execute format(
    'update public.%I as tgt '
    'set sort_order = src.ord - 1 '
    'from unnest($1) with ordinality as src(id, ord) '
    'where tgt.id = src.id',
    p_table
  ) using p_ids;
end;
$$;

revoke all on function public.reorder_records(text, uuid[]) from public, anon;
grant execute on function public.reorder_records(text, uuid[]) to authenticated;
