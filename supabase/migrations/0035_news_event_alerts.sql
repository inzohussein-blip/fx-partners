-- ===========================================================================
-- 0035 — exact release times for news events, so they can be alerted
-- ===========================================================================
-- broker_events.event_time is free text ("16:30 GMT"): fine to read, useless
-- to schedule from. A news event now carries the exact instant it is released
-- (starts_at), the indicator guide it belongs to (indicator, a slug from
-- src/lib/indicators.ts), and alert_sent_at, which /api/cron/news-alerts sets
-- when it posts the Telegram reminder — the claim that keeps an alert from
-- going out twice when two runs overlap.
-- ===========================================================================

alter table public.broker_events add column if not exists starts_at     timestamptz;
alter table public.broker_events add column if not exists indicator     text;
alter table public.broker_events add column if not exists alert_sent_at timestamptz;

create index if not exists broker_events_alert_due_idx
  on public.broker_events (starts_at)
  where kind = 'news' and alert_sent_at is null;

comment on column public.broker_events.starts_at is
  'Exact release instant (news events). Drives the Telegram reminder.';
comment on column public.broker_events.indicator is
  'Slug of the indicator guide at /indicators/<slug>, if any.';
comment on column public.broker_events.alert_sent_at is
  'When the Telegram reminder was posted; null = not yet.';
