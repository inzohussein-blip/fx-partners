-- ===========================================================================
-- Migration 0002 — Referral click tracking + signup attribution
-- ---------------------------------------------------------------------------
-- Run this if you applied schema.sql before referral tracking was added.
-- Fresh databases from the current schema.sql already include these.
-- Safe to run more than once.
-- ===========================================================================

create or replace function public.track_referral_click(link_slug text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  dest text;
begin
  update public.referral_links
     set clicks = clicks + 1
     where slug = link_slug and is_active = true
     returning target_url into dest;
  return dest;
end; $$;

create or replace function public.attribute_referral(link_slug text, client_email text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_link uuid;
  v_ib   uuid;
begin
  select id, ib_id into v_link, v_ib
    from public.referral_links
    where slug = link_slug and is_active = true;
  if v_ib is null then return; end if;

  update public.referral_links set signups = signups + 1 where id = v_link;

  insert into public.referrals (ib_id, link_id, client_email, status)
  values (v_ib, v_link, client_email, 'registered');
end; $$;

grant execute on function public.track_referral_click(text) to anon, authenticated;
grant execute on function public.attribute_referral(text, text) to anon, authenticated;
