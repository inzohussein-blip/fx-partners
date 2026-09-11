-- ===========================================================================
-- Migration 0026 — إغلاق ثغرة إعادة التوجيه المفتوحة في /r/<slug>
-- ---------------------------------------------------------------------------
-- المشكلة: مسار /r/<slug> يعيد التوجيه إلى referral_links.target_url كما هو.
-- الواجهة تعرض قائمة من ثلاثة مسارات داخلية فقط، لكن هذا قيد في المتصفّح لا
-- في قاعدة البيانات: الإدراج يتمّ من العميل مباشرةً، والسياسة الوحيدة التي
-- تحرسه هي:
--
--   create policy "links write own" on public.referral_links
--     for all using (owns_ib(ib_id)) with check (owns_ib(ib_id));
--
-- وهي تتحقّق من المِلكية فقط، لا من قيمة target_url. فأي وكيل معتمد يستطيع
-- تجاوز القائمة المنسدلة وكتابة:
--
--   target_url = 'https://evil.example/fake-login'
--
-- فيصبح https://<نطاقك>/r/<slug> إعادة توجيه مفتوحة على نطاقك أنت. وهذا
-- أخطر من الحالة العامة لهذه الثغرة: عمل المنصّة كلّه قائم على الثقة بروابطها،
-- والرابط نفسه مطبوع في البانرات الدعائية، ويضع كوكي إحالة عمره ٣٠ يوماً.
--
-- الحارس الحقيقي هو قاعدة البيانات، فالقيد هنا. وأضفنا تحقّقاً ثانياً في
-- المسار نفسه دفاعاً في العمق.
-- ===========================================================================

-- أعِد أي رابط خارجي قائم إلى الصفحة الرئيسية قبل فرض القيد.
update public.referral_links
   set target_url = '/'
 where target_url is null
    or target_url = ''
    or target_url !~ '^/'      -- مطلق: https:// أو javascript: أو غيره
    or target_url ~ '^//';     -- بروتوكول-نسبي: //evil.example

alter table public.referral_links
  drop constraint if exists referral_links_target_internal;

alter table public.referral_links
  add constraint referral_links_target_internal
  check (target_url ~ '^/' and target_url !~ '^//');

comment on constraint referral_links_target_internal on public.referral_links is
  'target_url must be a site-relative path. An absolute or protocol-relative URL would turn /r/<slug> into an open redirect on the brand domain.';
