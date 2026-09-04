-- ===========================================================================
-- Migration 0003 — Automatic welcome email on new partner signup
-- ---------------------------------------------------------------------------
-- Fires when a new row is inserted into public.profiles (a new partner), and
-- calls the app's welcome hook, which renders the React Email template and
-- sends it via the send-email edge function.
--
-- One-time setup (run once, with YOUR values):
--   alter database postgres
--     set app.settings.welcome_hook_url = 'https://YOUR-SITE/api/hooks/new-partner';
--   alter database postgres
--     set app.settings.welcome_hook_secret = 'YOUR-EMAIL_HOOK_SECRET';
--   -- then reconnect (settings apply to new sessions)
--
-- The same value must be set as EMAIL_HOOK_SECRET in the app's env.
-- Requires the pg_net extension (available on Supabase).
--
-- Alternative (no SQL): Supabase Dashboard → Database → Webhooks →
--   INSERT on public.profiles → HTTP POST to the same URL with header
--   x-hook-secret: <secret>.
-- ===========================================================================

create extension if not exists pg_net;

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
  -- Only fire when the hook URL has been configured.
  if hook_url is null or hook_url = '' then
    return new;
  end if;

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

  return new;
end;
$$;

drop trigger if exists t_profiles_welcome on public.profiles;
create trigger t_profiles_welcome
  after insert on public.profiles
  for each row execute function public.notify_new_partner();
