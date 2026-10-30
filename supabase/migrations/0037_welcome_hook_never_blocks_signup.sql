-- ===========================================================================
-- 0037 — a failing welcome email must never block a sign-up
-- ===========================================================================
-- notify_new_partner() (0003) runs inside the same transaction that creates
-- the auth user → profile row. If net.http_post raises (pg_net missing or
-- misconfigured, a malformed hook URL), the whole sign-up is rolled back and
-- Supabase reports "Database error saving new user" — a welcome email
-- taking down registration. The call is now wrapped: on any error it logs a
-- warning and lets the sign-up through. Behaviour is otherwise unchanged.
-- ===========================================================================

create or replace function public.notify_new_partner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hook_url text := current_setting('app.settings.welcome_hook_url', true);
  hook_secret text := current_setting('app.settings.welcome_hook_secret', true);
begin
  if hook_url is null or hook_url = '' then
    return new;
  end if;

  begin
    perform net.http_post(
      url := hook_url,
      body := jsonb_build_object(
        'record',
        jsonb_build_object('email', new.email, 'full_name', new.full_name)
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hook-secret', coalesce(hook_secret, '')
      )
    );
  exception when others then
    raise warning 'welcome hook skipped for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

revoke execute on function public.notify_new_partner() from public, anon, authenticated;
