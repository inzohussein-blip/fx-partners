-- ===========================================================================
-- Migration 0012 — Dynamic broker badges
-- ---------------------------------------------------------------------------
-- A free-form set of marketing badges per broker (🔥 الأعلى طلباً,
-- 🎁 أفضل بونص ترحيبي, 💎 شريك بلاتيني …), toggled from the admin panel and
-- rendered on the comparison + detail views.
-- ===========================================================================

alter table public.brokers
  add column if not exists badges text[] not null default '{}';
