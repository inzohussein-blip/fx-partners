-- ===========================================================================
-- Migration 0004 — Telegram alerts (new referral / new commission)
-- ---------------------------------------------------------------------------
-- Adds Telegram link columns to profiles and triggers that notify the agent
-- via the app hook (/api/hooks/telegram-notify) when a referral or an earning
-- is created. Requires pg_net (added in 0003).
--
-- One-time setup (with YOUR values):
--   alter database postgres
--     set app.settings.telegram_hook_url = 'https://YOUR-SITE/api/hooks/telegram-notify';
--   alter database postgres
--     set app.settings.telegram_hook_secret = 'YOUR-TELEGRAM_HOOK_SECRET';
-- ===========================================================================

alter table public.profiles
  add column if not exists telegram_chat_id text,
  add column if not exists telegram_link_token text;

create extension if not exists pg_net;

-- Generic notifier: POST a JSON payload to the app's telegram hook.
create or replace function public.tg_notify(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  hook_url text := current_setting('app.settings.telegram_hook_url', true);
  hook_secret text := current_setting('app.settings.telegram_hook_secret', true);
begin
  if hook_url is null or hook_url = '' then
    return;
  end if;
  perform net.http_post(
    url := hook_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-hook-secret', coalesce(hook_secret, '')
    )
  );
end;
$$;

-- New referral signed up under an IB.
create or replace function public.tg_on_referral()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.tg_notify(jsonb_build_object(
    'type', 'referral',
    'record', jsonb_build_object('ib_id', new.ib_id)
  ));
  return new;
end; $$;

drop trigger if exists t_tg_referral on public.referrals;
create trigger t_tg_referral after insert on public.referrals
  for each row execute function public.tg_on_referral();

-- New commission landed in the wallet.
create or replace function public.tg_on_earning()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.tg_notify(jsonb_build_object(
    'type', 'earning',
    'record', jsonb_build_object(
      'ib_id', new.ib_id, 'amount', new.amount, 'currency', new.currency
    )
  ));
  return new;
end; $$;

drop trigger if exists t_tg_earning on public.earnings;
create trigger t_tg_earning after insert on public.earnings
  for each row execute function public.tg_on_earning();
