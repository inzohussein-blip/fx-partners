-- ===========================================================================
-- FX Partners — Seed data (marketing content + demo partners/posts)
-- Run AFTER schema.sql. Safe to re-run (upserts by key/slug).
-- ===========================================================================

-- Editable page content -----------------------------------------------------
insert into public.site_content (key, value) values
  ('home.hero', jsonb_build_object(
      'titleTop', 'أقوى معاً،',
      'titleAccent', 'نجاح أعظم',
      'subtitle', 'نشارك الوكلاء وشركات التداول العالمية لفتح فرص جديدة ودفع النمو، بأعلى نسب العمولات وشفافية كاملة في الأرباح.',
      'cta', 'ابدأ الشراكة الآن'
  )),
  ('home.stats', jsonb_build_object(
      'partners', '2,400+',
      'volume', '$18B+',
      'countries', '60+',
      'payout', '$4.6M+'
  )),
  ('affiliates.rates', jsonb_build_object(
      'revenue_share', 'حتى 60%',
      'cpa', 'حتى $1,200',
      'sub_ib', 'نظام متعدد المستويات'
  ))
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Demo B2B / broker partners -------------------------------------------------
insert into public.partners (name, category, description, sort_order) values
  ('Global Markets Ltd', 'broker', 'وسيط عالمي منظّم يقدّم فروقات تنافسية.', 1),
  ('LiquidBridge', 'liquidity', 'مزوّد سيولة من الطبقة الأولى.', 2),
  ('TradeTech Systems', 'technology', 'حلول MT4/MT5 وواجهات API.', 3)
on conflict do nothing;

-- Demo blog posts ------------------------------------------------------------
insert into public.posts (slug, title, excerpt, body, status, published_at) values
  ('welcome-to-fx-partners',
   'أهلاً بك في FX Partners',
   'كل ما تحتاج معرفته لبدء رحلتك كشريك مالي معنا.',
   E'# أهلاً بك\n\nنحن سعداء بانضمامك إلى شبكة شركاء FX Partners...',
   'published', now()),
  ('how-ib-commissions-work',
   'كيف تعمل عمولات الوكلاء (IB)؟',
   'شرح مبسّط لنظام Revenue Share و CPA وكيفية احتساب أرباحك.',
   E'# نظام العمولات\n\nنقدّم نموذجين رئيسيين للأرباح...',
   'published', now())
on conflict (slug) do nothing;

-- Demo in-app announcements / changelog --------------------------------------
insert into public.announcements (title, body, category, published_at) values
  ('رفعنا عمولة تداول الذهب 5%',
   'ابتداءً من هذا الأسبوع، زدنا نسبة عمولتك على تداولات الذهب (XAU) بنسبة 5% لجميع المستويات. شارك رابط إحالتك الآن!',
   'commission', now()),
  ('لوحة المتصدّرين متاحة الآن',
   'تابع ترتيبك بين أفضل 10 وكلاء وارتقِ في المستويات لزيادة نسبة عمولتك تلقائياً.',
   'feature', now() - interval '2 days'),
  ('حاسبة مقارنة الوسطاء الجديدة',
   'جرّب حاسبة المقارنة على الصفحة الرئيسية لترى كم ستربح أكثر مع FX Partners مقابل وسيطك الحالي.',
   'feature', now() - interval '5 days')
on conflict do nothing;

-- Demo B2B meeting slots (next few business days, 30 min, UTC) ----------------
insert into public.meeting_slots (starts_at, duration_min, status)
select gs, 30, 'open'
from generate_series(
  date_trunc('day', now()) + interval '1 day' + interval '13 hours',
  date_trunc('day', now()) + interval '5 days' + interval '13 hours',
  interval '1 day'
) as gs
on conflict do nothing;

-- Demo broker directory ------------------------------------------------------
insert into public.brokers
  (slug, name, status, deposit_bonus, welcome_bonus, description, badges,
   spread_from, leverage_max, bonus_no_deposit, bonus_withdrawable, supports_gold, licenses, sort_order)
values
  ('alpha-markets', 'Alpha Markets', 'partnered', '100%', '$50',
   E'شركة تداول عالمية منظّمة تقدّم فروقات تنافسية وتنفيذاً سريعاً على منصّتي MT4/MT5.\n\nسحوبات سريعة ودعم عربي على مدار الساعة.',
   array['hot','platinum'], 0.1, '1:2000', true, true, true, array['fca','cysec'], 1),
  ('titan-fx', 'Titan FX', 'partnered', '50%', null,
   E'بيئة تداول ECN بفروقات من 0.0 نقطة، مناسبة للمتداولين المحترفين وصنّاع السوق.',
   array['low_spread'], 0.0, '1:500', false, true, true, array['asic','fsca'], 2),
  ('nova-trade', 'Nova Trade', 'not_partnered', null, '$25',
   E'شركة ناشئة تقدّم حساباً تجريبياً سخياً وأدوات تعليمية للمبتدئين.',
   array['best_welcome'], 0.6, '1:1000', true, false, false, array['fsa'], 3)
on conflict (slug) do nothing;

-- Demo referral links for the partnered brokers ------------------------------
insert into public.broker_links (broker_id, label, referral_url, agent_commission, client_benefits)
select b.id, 'الحساب القياسي', 'https://example.com/ref/' || b.slug, '$6 لكل لوت', 'سبريد مخفض + بدون عمولة'
from public.brokers b where b.slug in ('alpha-markets', 'titan-fx')
on conflict do nothing;

-- Demo approved reviews ------------------------------------------------------
insert into public.broker_reviews (broker_id, user_name, comment, stars, is_approved)
select b.id, 'متداول عربي', 'تجربة ممتازة، السحب سريع والدعم متعاون.', 5, true
from public.brokers b where b.slug = 'alpha-markets'
on conflict do nothing;

-- Demo discussion thread + staff reply ---------------------------------------
with t as (
  insert into public.broker_posts (broker_id, author_name, body)
  select b.id, 'خالد', 'كم يستغرق السحب عبر التحويل البنكي مع هذه الشركة؟'
  from public.brokers b where b.slug = 'alpha-markets'
  returning id, broker_id
)
insert into public.broker_posts (broker_id, parent_id, author_name, body, is_staff)
select t.broker_id, t.id, 'إدارة FX Partners',
       'عادةً خلال 24 ساعة عمل، وأحياناً أسرع عبر المحافظ الإلكترونية.', true
from t;
