-- ===========================================================================
-- Migration 0023 — Atomic single-field content merge RPC
-- ---------------------------------------------------------------------------
-- Inline on-page editing saves one field at a time. The server action used to
-- read the whole site_content.value, merge the field in JS, then upsert it back
-- (read-modify-write). Two concurrent edits to different fields of the same key
-- could each read the same snapshot and the later write would drop the other's
-- change. This function performs the merge inside a single INSERT ... ON
-- CONFLICT statement using jsonb concatenation, so the merge reads the current
-- row under its lock — no lost updates.
--
-- Safety: SECURITY DEFINER + is_admin() gate (matching site_content's RLS).
-- ===========================================================================

create or replace function public.set_content_field(
  p_key text,
  p_field text,
  p_value jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_key is null or p_field is null then
    raise exception 'key and field are required';
  end if;

  insert into public.site_content (key, value, updated_by, updated_at)
  values (p_key, jsonb_build_object(p_field, p_value), auth.uid(), now())
  on conflict (key) do update
    set value = coalesce(public.site_content.value, '{}'::jsonb)
                  || jsonb_build_object(p_field, p_value),
        updated_by = auth.uid(),
        updated_at = now();
end;
$$;

revoke all on function public.set_content_field(text, text, jsonb) from public, anon;
grant execute on function public.set_content_field(text, text, jsonb) to authenticated;
