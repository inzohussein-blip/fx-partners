-- ===========================================================================
-- 0029 — security & performance hardening (from Supabase advisors)
-- ===========================================================================
-- Two advisor categories, addressed conservatively so nothing the app relies
-- on changes behaviour:
--
--  SECURITY
--   • Pin a fixed search_path on the two trigger helpers the linter flagged
--     (both only call now(), so an empty path is safe).
--   • Revoke EXECUTE from PUBLIC/anon/authenticated on internal functions that
--     were needlessly reachable over the REST RPC endpoint. Every function
--     revoked here is either a trigger function (fired by the database as the
--     table owner, never called directly) or an internal helper invoked only
--     from inside another SECURITY DEFINER function — so removing the public
--     grant closes the endpoint without affecting any trigger or internal call.
--
--   Deliberately NOT touched:
--   • is_admin / owns_ib / owns_forum_channel / can_create_channel — these are
--     evaluated inside RLS policies as the querying role, so anon/authenticated
--     MUST keep EXECUTE or public reads break.
--   • attribute_referral / track_referral_click / leaderboard / site_stats /
--     forum_increment_views / set_content_field / reorder_records — called by
--     the app over .rpc(); the caller needs the grant.
--   • apply_earning_to_wallet / apply_withdrawal_to_wallet — left as-is per the
--     owner's instruction to leave the wallet feature untouched for now.
--
--  PERFORMANCE
--   • Add the missing index on every foreign-key column, so cascades and
--     joins on those keys stop doing sequential scans as the tables grow.
--
-- Not done here (deliberately deferred, low value at current scale, higher
-- risk): consolidating multiple permissive RLS policies, and wrapping
-- auth.uid() in a scalar subselect across ~19 policies.
-- ===========================================================================

-- --- SECURITY: fixed search_path on the flagged trigger helpers -------------
alter function public.touch_updated_at() set search_path = '';
alter function public.forum_touch_updated_at() set search_path = '';

-- --- SECURITY: close the RPC endpoint on internal-only functions ------------
-- Trigger functions: fired by the database, never a legitimate RPC target.
revoke execute on function public.forum_guard_channel_status() from public, anon, authenticated;
revoke execute on function public.handle_new_user()            from public, anon, authenticated;
revoke execute on function public.notify_new_partner()         from public, anon, authenticated;
revoke execute on function public.tg_on_earning()              from public, anon, authenticated;
revoke execute on function public.tg_on_referral()             from public, anon, authenticated;
revoke execute on function public.trg_broker_review()          from public, anon, authenticated;
revoke execute on function public.trg_link_click()             from public, anon, authenticated;
revoke execute on function public.trg_post_vote()              from public, anon, authenticated;
revoke execute on function public.trg_referral_tier()          from public, anon, authenticated;
revoke execute on function public.touch_updated_at()           from public, anon, authenticated;
revoke execute on function public.forum_touch_updated_at()     from public, anon, authenticated;

-- Internal helpers: only ever invoked from inside other SECURITY DEFINER
-- functions (which run as the owner and keep their own access).
revoke execute on function public.recompute_broker_rating(uuid) from public, anon, authenticated;
revoke execute on function public.recompute_ib_tier(uuid)       from public, anon, authenticated;
revoke execute on function public.recompute_post_votes(uuid)    from public, anon, authenticated;
revoke execute on function public.tg_notify(jsonb)              from public, anon, authenticated;

-- --- PERFORMANCE: index every unindexed foreign-key column ------------------
create index if not exists idx_agreements_ib_id            on public.agreements(ib_id);
create index if not exists idx_bookings_slot_id            on public.bookings(slot_id);
create index if not exists idx_broker_posts_user_id        on public.broker_posts(user_id);
create index if not exists idx_broker_reviews_user_id      on public.broker_reviews(user_id);
create index if not exists idx_broker_subscriptions_user_id on public.broker_subscriptions(user_id);
create index if not exists idx_campaigns_broker_id         on public.campaigns(broker_id);
create index if not exists idx_coupons_broker_id           on public.coupons(broker_id);
create index if not exists idx_earnings_referral_id        on public.earnings(referral_id);
create index if not exists idx_forum_comments_author_id    on public.forum_comments(author_id);
create index if not exists idx_forum_comments_parent_id    on public.forum_comments(parent_id);
create index if not exists idx_forum_posts_author_id       on public.forum_posts(author_id);
create index if not exists idx_forum_reactions_user_id     on public.forum_reactions(user_id);
create index if not exists idx_posts_author_id             on public.posts(author_id);
create index if not exists idx_referrals_link_id           on public.referrals(link_id);
create index if not exists idx_signals_broker_id           on public.signals(broker_id);
create index if not exists idx_site_content_updated_by     on public.site_content(updated_by);
create index if not exists idx_trading_resources_broker_id on public.trading_resources(broker_id);
