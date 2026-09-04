# FX Partners

منصة الشراكة المالية (IB / Affiliate / B2B) لشركة **FX Partners** — مبنية بـ
**Next.js (App Router) + Tailwind CSS + Supabase**، وجاهزة للنشر على **Vercel**.

الموقع ثنائي الطبقة:

1. **الواجهة العامة (Marketing):** الرئيسية، صفحة الوكلاء (IB)، صفحة الشركات (B2B)، والمدونة.
2. **لوحة الشريك المحمية (Dashboard):** النظرة العامة (رسوم بيانية Recharts)، العملاء (جدول بحث/فرز/فلترة)، **الأسواق والأخبار** (تقويم اقتصادي + أخبار من TradingView)، أدوات التسويق (روابط الإحالة)، والمحفظة والسحوبات.
3. **لوحة الإدارة (Admin):** اعتماد الوكلاء (IBs) ومعالجة طلبات السحب — تظهر فقط لمن دوره `admin`.

---

## تعدد اللغات (next-intl)

العربية هي اللغة **الأساسية** وتُخدَّم على `/` بلا بادئة، والإنجليزية على `/en`
(`localePrefix: as-needed`). الكشف التلقائي عن لغة المتصفّح **مُعطّل**
(`localeDetection: false`) حتى تبقى العربية الافتراضية دائماً، والإنجليزية
اختيارية عبر مبدّل اللغة في الهيدر.

- الإعداد في `src/i18n/` (routing / navigation / request) وكتالوجات الرسائل في
  `messages/ar.json` و`messages/en.json`.
- كل الصفحات تحت `src/app/[locale]/`؛ وحدها معالِجات المسارات (`auth/`, `r/`)
  خارجها. الـ middleware يدمج توجيه اللغة مع تحديث جلسة Supabase وحماية اللوحة.
- المُترجَم حالياً: الصفحة الرئيسية، الهيدر/الفوتر، وصفحات المصادقة. بقية
  الصفحات تبقى بالعربية (اللغة الأساسية) وتُترجَم تدريجياً عند الحاجة.
- محتوى الـ Hero العربي يبقى قابلاً للتحرير من لوحة المحتوى؛ والإنجليزية تأخذ
  نصّها من كتالوج الرسائل.

## 1) قرار المعمارية: لماذا Supabase مباشرة بدلاً من Payload/Strapi؟

راجعنا الخيارات (جداول Supabase مخصصة مقابل دمج Payload CMS / Strapi)،
والتوصية المعتمدة في هذا المشروع هي **الاعتماد على جداول Supabase مخصصة**:

| المعيار | جداول Supabase مخصصة ✅ (المعتمد) | Payload / Strapi |
|---|---|---|
| المصادقة | Supabase Auth واحدة للموقع واللوحة | نظام مصادقة ثانٍ منفصل |
| الأمان المالي | **RLS على مستوى كل صف** — أساسي للبيانات المالية | RLS أضعف/يدوي فوق قاعدة منفصلة |
| التشغيل | خدمة واحدة (Supabase + Vercel) | خدمة/سيرفر إضافي يجب استضافته وصيانته |
| التحكم بالمحتوى بدون كود | Supabase Studio + جدول `site_content` و`posts` | لوحة تحرير أغنى (ميزة الطرف الآخر) |

**الخلاصة:** لبيانات مالية حساسة، الأولوية للأمان والبساطة. نستخدم جدولي
`posts` و`site_content` لجعل النصوص والمنشورات قابلة للتعديل بدون إعادة نشر،
وتُدار من Supabase Studio مباشرة. لو احتجت لاحقاً محرّر محتوى غني لغير
المبرمجين، يمكن إضافة Payload **كطبقة CMS للتسويق فقط** دون المساس بجداول
الأموال والمصادقة.

---

## 2) قاعدة البيانات (Database Schema)

كل جداول العمل موجودة في [`supabase/schema.sql`](./supabase/schema.sql) مع **RLS
مُفعّل على كل جدول**. الجداول الرئيسية:

- `profiles` — امتداد لـ `auth.users` (الأدوار: partner / ib / broker / admin).
- `ib_accounts` — حساب الوكيل (IB code، نسبة العمولة، CPA، نظام Sub-IB متعدد المستويات).
- `referral_links` — روابط الإحالة الديناميكية (slug، حملة، نقرات، تسجيلات).
- `referrals` — العملاء المُحالون وحجم تداولهم.
- `earnings` — سجل العمولات (append-only، يُغذّى من منطق موثوق/trigger).
- `wallets` — رصيد كل وكيل (يُحدَّث آلياً عبر trigger عند تسجيل ربح).
- `withdrawals` — طلبات السحب (الوكيل يطلب، الإدارة تعتمد).
- `posts` — منشورات المدونة القابلة للتعديل.
- `site_content` — نصوص الصفحات (JSON) القابلة للتعديل بدون كود.
- `partners` — شعارات وأوصاف شركاء B2B المعروضين على الموقع.

مبدأ الأمان: **الوكيل يقرأ/يكتب صفوفه فقط**، والحقول المالية (`earnings`,
مبالغ `wallets`) غير قابلة للكتابة مباشرةً من الوكيل — تُنتَج من triggers أو
service role موثوق. الأدمن (`profiles.role = 'admin'`) يدير كل شيء.

---

## 3) هيكل الملفات (Project Structure)

```
fx-partners/
├── supabase/
│   ├── schema.sql          # الجداول + RLS + triggers
│   └── seed.sql            # بيانات تجريبية للمحتوى والشركاء والمنشورات
├── src/
│   ├── app/
│   │   ├── layout.tsx      # RTL + خط Cairo + الميتاداتا
│   │   ├── globals.css
│   │   ├── page.tsx        # الصفحة الرئيسية
│   │   ├── affiliates/     # صفحة الوكلاء (IB)
│   │   ├── brokers/        # صفحة الشركات (B2B)
│   │   ├── blog/           # المدونة + صفحة المنشور [slug]
│   │   ├── login/          # تسجيل الدخول / إنشاء حساب
│   │   ├── auth/           # callback + sign-out
│   │   └── dashboard/      # اللوحة المحمية
│   │       ├── layout.tsx  # حارس الجلسة + الشريط الجانبي
│   │       ├── page.tsx            # النظرة العامة
│   │       ├── marketing/page.tsx  # أدوات التسويق
│   │       └── wallet/page.tsx     # المحفظة والسحوبات
│   ├── components/         # الهيدر/الفوتر + مكوّنات UI واللوحة
│   └── lib/
│       ├── supabase/       # client / server / middleware
│       ├── content.ts      # قراءة site_content مع fallback
│       └── utils.ts
├── middleware.ts           # تحديث الجلسة + حماية /dashboard
└── .env.example
```

---

## البدء السريع (Getting Started)

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد البيئة
cp .env.example .env.local
#   ثم املأ NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
#   من: Supabase Dashboard → Project Settings → API

# 3) إنشاء قاعدة البيانات
#   افتح Supabase → SQL Editor والصق محتوى supabase/schema.sql ثم شغّله
#   (اختياري) شغّل supabase/seed.sql لبيانات تجريبية

# 4) التشغيل محلياً
npm run dev        # http://localhost:3000
```

> يعمل الموقع حتى قبل ضبط Supabase (يعرض محتوى افتراضياً)، لكن تسجيل الدخول
> واللوحة يحتاجان متغيرات البيئة.

### لوحة الإدارة (Admin)

صفحة `/dashboard/admin` تتيح للأدمن:

- **اعتماد الوكلاء:** تغيير حالة `ib_accounts` (اعتماد / رفض / تعليق). عند
  الاعتماد يُنشأ سجل محفظة تلقائياً.
- **معالجة طلبات السحب:** نقل الطلب بين (قيد المعالجة / تم الدفع / رفض). عند
  «تم الدفع» يخصم trigger المبلغ من رصيد المحفظة ويضيفه إلى `total_withdrawn`.
- **إدارة المحتوى بدون كود** (تبويبات في `/dashboard/admin`):
  - **المنشورات:** إنشاء/تحرير/حذف منشورات المدونة وتغيير حالتها (مسودة/منشور/مؤرشف).
  - **النصوص:** تعديل نصوص الصفحات (`home.hero`, `home.stats`, `affiliates.rates`)
    وتُحدَّث الواجهة العامة فوراً عبر `revalidatePath`.
  - **الشركاء:** إضافة/تحرير/حذف شركات B2B المعروضة في صفحة `/brokers`.

الوصول محكوم بدور المستخدم (`profiles.role`) على مستوى الواجهة و RLS معاً.
لترقية مستخدم إلى أدمن، نفّذ في Supabase SQL Editor:

```sql
update public.profiles set role = 'admin'
where email = 'you@example.com';
```

> إن كنت قد شغّلت `schema.sql` قبل إضافة لوحة الإدارة، شغّل ملف الترحيل
> [`supabase/migrations/0001_admin_withdrawal_trigger.sql`](./supabase/migrations/0001_admin_withdrawal_trigger.sql)
> لإضافة trigger خصم المحفظة عند الدفع.

## النشر على Vercel

1. ادفع المستودع إلى GitHub.
2. استورد المشروع في Vercel واربطه بالمستودع.
3. أضِف متغيرات البيئة نفسها (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).
4. في Supabase → Authentication → URL Configuration، أضِف دومين Vercel إلى
   Redirect URLs.

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل بيئة التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run start` | تشغيل نسخة الإنتاج |
| `npm run lint` | فحص ESLint |
| `npm run typecheck` | فحص أنواع TypeScript |

---

## تتبّع الإحالات (Referral Tracking)

روابط الإحالة المولّدة من **أدوات التسويق** بصيغة `‎/r/<slug>`. عند فتح الرابط:

1. يزيد route `‎/r/[slug]` عدّاد `referral_links.clicks` عبر دالة آمنة
   (`track_referral_click`, SECURITY DEFINER — لأن الزائر مجهول ولا يملك صلاحية
   الكتابة عبر RLS).
2. يضع كوكي `fxp_ref` (30 يوماً) لنسب التسجيل لاحقاً.
3. يعيد التوجيه إلى الصفحة الهدف للرابط.

عند تأكيد التسجيل، يقرأ `‎/auth/callback` الكوكي ويستدعي `attribute_referral`
التي تزيد `signups` وتُنشئ صفاً في `referrals` — فتصبح إحصائيات لوحة الوكيل حيّة.

> لقواعد البيانات القائمة، شغّل
> [`supabase/migrations/0002_referral_tracking.sql`](./supabase/migrations/0002_referral_tracking.sql).

## البريد الاحترافي للشركاء (React Email + Supabase Edge Function)

قوالب بريد مصمّمة بـ **React Email** (بهوية FX Partners) في `src/emails/`:
`welcome` (وكيل جديد)، `withdrawal_requested` (تأكيد طلب سحب)، و`monthly_report`
(تقرير الأرباح الشهري).

آلية الإرسال:

1. يرسم Next القالب إلى HTML عبر `@react-email/render` (`src/lib/email.ts`).
2. يُرسل فعلياً عبر **Supabase Edge Function** `supabase/functions/send-email`
   التي تستدعي **Resend**.

مثال مطبّق: عند طلب سحب ناجح يُرسَل بريد التأكيد تلقائياً (best-effort).

### الإعداد

```bash
# 1) انشر دالة الإرسال
supabase functions deploy send-email

# 2) اضبط أسرار Resend (احصل على مفتاح من resend.com)
supabase secrets set RESEND_API_KEY=re_xxx \
  RESEND_FROM="FX Partners <partners@your-domain.com>"
```

- بدون ضبط Resend لا يتعطّل شيء — الإرسال يفشل بصمت (best-effort).

### بريد الترحيب التلقائي (عند تسجيل وكيل جديد)

مربوط بمشغّل تلقائي: عند إدراج ملف شريك جديد في `profiles`، يستدعي trigger
مسار `‎/api/hooks/new-partner` الذي يرسم قالب الترحيب ويرسله.

التفعيل لمرة واحدة:

```sql
-- 1) طبّق الترحيل
--    supabase/migrations/0003_welcome_email_trigger.sql
-- 2) اضبط الرابط والسرّ على قاعدة البيانات (بقيمك):
alter database postgres
  set app.settings.welcome_hook_url = 'https://YOUR-SITE/api/hooks/new-partner';
alter database postgres
  set app.settings.welcome_hook_secret = 'YOUR-SECRET';
```

- اضبط نفس السرّ في بيئة التطبيق: `EMAIL_HOOK_SECRET=YOUR-SECRET`،
  و`SUPABASE_SERVICE_ROLE_KEY` (ليُرسل الـ hook بلا جلسة مستخدم).
- بديل بلا SQL: Supabase → Database → Webhooks → INSERT على `profiles` →
  POST إلى نفس الرابط مع ترويسة `x-hook-secret`.
- `monthly_report` جاهز كدالة `sendPartnerEmail(...)` تُستدعى من دالة مجدولة شهرياً.

## المكتبات المعتمدة

- **TradingView Lightweight Charts** — شارت الأسواق الحيّ في الصفحة الرئيسية،
  بتغذية أسعار حقيقية من **Twelve Data** عبر بروكسي خادمي (`/api/markets`) يُبقي
  المفتاح سرّياً. اضبط `TWELVEDATA_API_KEY`؛ وبدونه يتحوّل الشارت تلقائياً إلى
  بيانات توضيحية (شارة LIVE/DEMO تظهر المصدر).
- **Recharts** — الرسوم البيانية في لوحة النظرة العامة (الأرباح والإحالات الشهرية).
- **React Hook Form + Zod** — التحقق من نماذج المال (السحب/التسجيل)؛ نموذج السحب
  يتحقق من الرصيد على الخادم عبر `requestWithdrawal` (لا يمكن تجاوزه من العميل).
- نمط **Data Table** (بحث/فرز/فلترة) في صفحة العملاء — مستلهَم من قوالب
  shadcn dashboard دون تبنّي القالب كاملاً (نبقى Supabase-native).
- **Lucide React** — أيقونات الواجهة (مُستخدمة في كل المكوّنات).
- **Framer Motion** — ظهور ناعم للأقسام عند التمرير (`Reveal`).
- **Sonner** — تنبيهات Toast (نسخ رابط الإحالة، تقديم السحب، الحفظ، الأخطاء).
- **Radix UI Slider** — شريط حاسبة الأرباح التفاعلية على الرئيسية.
- **fawazahmed0/currency-api** — أسعار صرف حيّة (بلا مفتاح) لتحويل عملة الحاسبة،
  مع جدول أسعار احتياطي عند تعذّر الجلب.

## الخطوات التالية المقترحة

- **تعدد اللغات (next-intl):** كمرحلة مخصّصة — routing `[locale]` وكتالوجات
  رسائل وتبديل RTL/LTR (العربية/الإنجليزية) للوصول العالمي.
- ربط webhook من منصة التداول لتغذية `referrals` و`earnings` تلقائياً.
- تقارير تفصيلية لكل حملة (نقرات ← تسجيلات ← تمويل).
