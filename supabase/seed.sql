-- ===========================================================================
-- FX Partners — بذرة الشركات الست
-- ===========================================================================
-- ما في هذا الملف: الاسم، الوصف، والتراخيص — وكلّها مأخوذة من معلومات
-- منشورة وقابلة للتحقّق، مع رقم كل ترخيص مكتوباً في التعليقات لتراجعه
-- على سجلّ الجهة الرقابية نفسها قبل الاعتماد عليه.
--
-- ما ليس في هذا الملف عمداً: السبريد، البونصات، الرافعة، الحد الأدنى
-- للإيداع، والعمولات. هذه شروط تجارية تتغيّر شهرياً وتختلف باختلاف
-- اتفاقيتك أنت كوكيل ماستر — مصدرها الصحيح هو عقودك، لا البحث.
-- الواجهة تُخفي كل حقل فارغ، فلا تظهر أصفار ولا شرطات مكان الناقص.
--
-- كذلك ليس فيه rating و reviews_count: تُبنى من جدول broker_reviews
-- من مراجعات حقيقية. تقييم مكتوب باليد على منصّة مقارنة هو بالضبط ما
-- يجعل الزائر لا يثق بك.
--
-- ⚠️ ملاحظة جوهرية عن التراخيص:
-- كل شركة هنا تعمل عبر عدّة كيانات قانونية تحت جهات رقابية مختلفة.
-- الترخيص الذي ينطبق فعلياً على عميلك هو ترخيص الكيان الذي يُفتح حسابه
-- لديه عبر رابط الإحالة الخاص بك — وهذا تعرفه أنت من اتفاقيتك.
-- إن كان رابطك يفتح حسابات لدى الكيان الخارجي (سيشل/فانواتو/بليز)،
-- احذف رموز fca و asic و cysec من مصفوفة licenses لتلك الشركة.
-- عرض ترخيص لا يغطّي حساب العميل تضليل، حتى لو كان الترخيص حقيقياً.
--
-- آمن للتشغيل أكثر من مرّة. تنبيه: إعادة التشغيل تُعيد description و
-- licenses إلى القيم أدناه — أي تعديل يدوي عليهما سيُستبدل.
-- ===========================================================================

begin;

insert into public.brokers (slug, name, status, description, licenses, sort_order, is_published)
values

  -- One Royal — oneroyal.com
  --   ASIC  · AFSL 420268   · Royal Financial Trading Pty Ltd (أستراليا)
  --   CySEC · 312/16        · Royal Financial Trading (CY) Ltd (قبرص)
  --   SVG FSA · 149 LLC 2019 · تسجيل شركة فقط، وليس ترخيص تداول — لم يُدرج
  --   VFSC  · 700284        · Royal CM Limited (فانواتو) — الرمز غير مدعوم
  ('oneroyal', 'One Royal', 'not_partnered',
   'شركة تداول تعمل عبر عدّة كيانات: Royal Financial Trading Pty Ltd المرخّصة من هيئة ASIC الأسترالية، و Royal Financial Trading (CY) Ltd المرخّصة من CySEC القبرصية، إلى جانب كيانات خارجية في سانت فنسنت وفانواتو. الترخيص الذي يحميك هو ترخيص الكيان الذي يُفتح حسابك لديه، فتحقّق منه قبل الإيداع.',
   array['asic','cysec'], 1, true),

  -- Vantage Markets — vantagemarkets.com
  --   FCA   · OC376560      · Vantage Global Prime LLP (بريطانيا)
  --   ASIC  · AFSL 428901   · Vantage Global Prime Pty Ltd (أستراليا)
  --   FSCA  · FSP 51268     · Vantage Markets Pty Ltd (جنوب أفريقيا)
  --   CIMA  · SIBL 1383491  · Vantage International Group Ltd — الرمز غير مدعوم
  --   VFSC  · 700271        · Vantage Global Limited — الرمز غير مدعوم
  ('vantage', 'Vantage Markets', 'not_partnered',
   'مجموعة تداول عالمية تعمل عبر عدّة كيانات: Vantage Global Prime LLP المرخّصة من هيئة FCA البريطانية، و Vantage Global Prime Pty Ltd من ASIC الأسترالية، و Vantage Markets Pty Ltd من FSCA في جنوب أفريقيا، إضافةً إلى كيانات في جزر كايمان وفانواتو. معظم عملاء المنطقة يُفتح لهم حساب لدى الكيان الخارجي، فتأكّد من كيانك.',
   array['fca','asic','fsca'], 2, true),

  -- XM — xm.com (مجموعة Trading Point)
  --   CySEC · 120/10        · Trading Point of Financial Instruments Ltd
  --   ASIC  · AFSL 443670   · Trading Point of Financial Instruments Pty Ltd
  --   DFSA  · F003484       · Trading Point MENA Limited (دبي)
  --   FSC بليز · 000261/27  · XM Global Limited — رمز fscm في الموقع لموريشيوس، فلم يُدرج
  ('xm', 'XM', 'not_partnered',
   'الاسم التجاري لمجموعة Trading Point، وتعمل عبر عدّة كيانات: Trading Point of Financial Instruments Ltd المرخّصة من CySEC القبرصية، و Trading Point of Financial Instruments Pty Ltd من ASIC الأسترالية، و Trading Point MENA Limited المرخّصة من هيئة DFSA في مركز دبي المالي العالمي، إضافةً إلى XM Global Limited المرخّصة من FSC في بليز والتي تستقبل معظم العملاء الدوليين.',
   array['cysec','asic','dfsa'], 3, true),

  -- INZO — inzo.co
  --   FSA سيشل · SD163      · INZO Group LTD
  --   MISA جزر القمر · T2023182 — الرمز غير مدعوم
  ('inzo', 'INZO', 'not_partnered',
   'شركة تداول تعمل عبر INZO Group LTD المرخّصة من هيئة الخدمات المالية في سيشل (FSA) برقم SD163، إلى جانب تسجيل في جزر القمر. هذه تراخيص خارجية: مستوى الحماية التنظيمية وضمانات تعويض العملاء فيها أقلّ ممّا توفّره التراخيص الأوروبية والأسترالية.',
   array['fsa'], 4, true),

  -- TNFX — tnfx.co
  --   FSA سيشل · SD133      · TNFX Ltd
  ('tnfx', 'TNFX', 'not_partnered',
   'الاسم التجاري لشركة TNFX Ltd المسجّلة في سيشل والمرخّصة من هيئة الخدمات المالية (FSA) كوسيط أوراق مالية برقم SD133. ترخيص خارجي: مستوى الحماية التنظيمية فيه أقلّ ممّا توفّره التراخيص الأوروبية والأسترالية.',
   array['fsa'], 5, true),

  -- Altima — لم يُعثر على كيان قانوني وترخيص قابلين للتحقّق باسم واضح.
  -- تبقى is_published = false: نشر شركة على منصّة مقارنة بلا أي بيان
  -- رقابي متحقَّق منه هو الشيء الوحيد الذي لا يجوز فعله هنا.
  -- املأ القسم (2) أدناه ثم انشرها.
  ('altima', 'Altima', 'not_partnered',
   'قيد التوثيق: لم يكتمل بعد التحقّق من الكيان القانوني ورقم الترخيص. لا تُنشر حتى يكتمل.',
   array[]::text[], 6, false)

on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  licenses    = excluded.licenses,
  sort_order  = excluded.sort_order;

commit;


-- ===========================================================================
-- 2) الشروط التجارية — املأها من اتفاقياتك أنت
-- ===========================================================================
-- انسخ الكتلة، غيّر الـ slug، واملأ ما تتحقّق منه فقط. اترك أي حقل لا
-- تعرفه على حاله — الواجهة تُخفيه.
--
--   status:          'partnered' فقط لمن لديك معها اتفاقية ماستر فعلية.
--   deposit_methods: مصفوفة نصّية، لا نصّ واحد.
--   licenses:        الرموز المدعومة فقط —
--                    fca · asic · cysec · dfsa · fsa · fsca · fscm · cbcs
--
-- update public.brokers set
--   status             = 'partnered',
--   logo_url           = 'https://.../logo.svg',
--   spread_from        = 0.0,
--   leverage_max       = '1:500',
--   min_deposit        = 100,
--   deposit_methods    = array['تحويل بنكي','بطاقات','عملات رقمية'],
--   deposit_bonus      = null,
--   welcome_bonus      = null,
--   bonus_no_deposit   = false,
--   bonus_withdrawable = false,
--   supports_gold      = true,
--   supports_ea        = true,
--   allows_hedging     = true,
--   allows_scalping    = true,
--   swap_free          = true,
--   badges             = array['low_spread']
-- where slug = 'oneroyal';


-- ===========================================================================
-- 3) النشر
-- ===========================================================================
-- الخمس شركات الأولى منشورة من القسم (1). لنشر Altima بعد توثيقها:
--
-- update public.brokers set is_published = true where slug = 'altima';
--
-- ولإخفاء أي شركة مؤقتاً:
-- update public.brokers set is_published = false where slug = '...';


-- ===========================================================================
-- 4) فحص الحالة
-- ===========================================================================
-- select slug, name, status, is_published,
--        coalesce(array_length(licenses,1),0) as licenses_count,
--        spread_from, min_deposit, rating, reviews_count
-- from public.brokers order by sort_order;
