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
