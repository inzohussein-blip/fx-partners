# الانتقال من Vercel إلى Cloudflare

الموقع يعمل الآن على **Cloudflare Workers** عبر المحوّل الرسمي OpenNext
(`@opennextjs/cloudflare` 1.20) مع **Next.js 16.4** وReact 19.
النطاق: `partners-fx.trade`.

## ما تحتاجه (مرّة واحدة)

| الشيء | التفاصيل |
|---|---|
| **خطة Workers المدفوعة** | حجم الموقع المضغوط نحو **3.7MB**، والخطة المجانية حدّها 3MB. الخطة المدفوعة (5$ شهرياً) حدّها 10MB. |
| **`CLOUDFLARE_API_TOKEN`** | Cloudflare → My Profile → API Tokens → Create Token → قالب **Edit Cloudflare Workers**. |
| **`CLOUDFLARE_ACCOUNT_ID`** | Cloudflare → Workers & Pages → الشريط الجانبي الأيمن (Account ID). |

## الخطوات

### 1) أسرار GitHub (للنشر التلقائي)
GitHub → Settings → Secrets and variables → Actions:

- **Secrets:** `CLOUDFLARE_API_TOKEN`، `CLOUDFLARE_ACCOUNT_ID`
- **Variables** (قيم عامة بطبيعتها، تُدمج في الجافاسكربت وقت البناء):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL` = `https://partners-fx.trade`
  - اختيارية: `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`، `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`، `NEXT_PUBLIC_SAME_AS`

> لا تضع `SUPABASE_SERVICE_ROLE_KEY` هنا. المستودع عام.

### 2) أسرار التشغيل في Cloudflare
بعد أول نشر: Workers & Pages → **fx-partners** → Settings → **Variables and Secrets**،
أضف كـ **Secret** (التي تستخدمها عندك فقط):

`SUPABASE_SERVICE_ROLE_KEY`، `EMAIL_HOOK_SECRET`، `TELEGRAM_BOT_TOKEN`،
`TELEGRAM_HOOK_SECRET`، `TELEGRAM_ADMIN_CHAT_ID`، `TELEGRAM_SIGNALS_CHAT_ID`،
`TWELVEDATA_API_KEY`.

نشر لاحق لا يمحوها.

### 3) النشر
اضغط **Run workflow** على `Deploy to Cloudflare Workers` (يعمل تلقائياً أيضاً عند الدمج في `main`).
أو يدوياً من جهازك: `npm run cf:deploy` (بعد `npx wrangler login`).

النطاق `partners-fx.trade` يُربط تلقائياً بالـWorker (`wrangler.jsonc` → `routes`)،
وتُنشأ سجلات DNS والشهادة وحدها لأن النطاق في الحساب نفسه.

### 4) Supabase (مهم، وإلا يتعطّل الدخول)
Supabase → Authentication → URL Configuration:

- **Site URL:** `https://partners-fx.trade`
- **Redirect URLs:** أضف `https://partners-fx.trade/**`
  (روابط تأكيد البريد واستعادة كلمة المرور تمرّ عبر `/auth/callback`).

### 5) أشياء أخرى
- **`www`:** لا يُربط تلقائياً. أنشئ Redirect Rule في Cloudflare من
  `www.partners-fx.trade` إلى `https://partners-fx.trade` (301).
- **Web Analytics (اختياري):** أنشئ موقعاً في Analytics & Logs → Web Analytics،
  ضع الـtoken في `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`، و**أبقِ «Automatic setup» مطفأً**:
  تفعيله يحقن السكربت قبل موافقة الزائر على الكوكيز.
- **عنوان `workers.dev`:** يبقى يعمل بجانب النطاق. أطفئه من Settings → Domains & Routes
  حتى لا يُفهرَس نسخة ثانية من الموقع.
- **Vercel:** بعد التأكد أن كل شيء يعمل على النطاق الجديد، احذف المشروع هناك.

## ما تغيّر في الكود
- إعداد Cloudflare: `wrangler.jsonc`، `open-next.config.ts`، سكربتات `cf:*`، ومسار النشر `.github/workflows/cloudflare.yml`.
- **ترقية Next.js من 14 إلى 16.4 وReact إلى 19:** `params` و`cookies()` و`headers()` صارت غير متزامنة (حُوّلت 63 ملفاً بأداة Next الرسمية)، و`next lint` استُبدل بـ `eslint .` (ESLint 9)، وnext-intl إلى 4.
- حُذف `runtime = "edge"` من مسارات الصور (غير مدعوم في OpenNext)، وبقي كل شيء يعمل على Node داخل الـWorker.
- عنوان IP للزائر لتحديد المعدّل ودولته للنقرات: يُقرآن من ترويسات Cloudflare (`cf-connecting-ip`، `cf-ipcountry`).
- استُبدل Vercel Analytics وSpeed Insights بـ Cloudflare Web Analytics، وبقي مشروطاً بموافقة الزائر.
- **سياسة الخصوصية وصفحة الكوكيز** صارتا تذكران Cloudflare بدل Vercel (مهم قانونياً).
- إصلاح خطأ قديم: بطاقة المشاركة لصفحة الشركة (`/api/og/broker`) كانت تنهار عند وجود الفاصل «·» أو النجوم لأنهما خارج الخط المحمَّل.
  والخطوط تُحمَّل دائماً الآن، وتُعاد بطاقة SVG بديلة إن تعذّر تحميلها.

## الحدود المعروفة
- لا ذاكرة تخزين للصفحات (ISR): الصفحات التي فيها `revalidate` تُولَّد عند كل طلب. الخطر قليل لأن بياناتها من Supabase.
  أضف R2 لاحقاً في `open-next.config.ts` إن زادت الكلفة.
- `rate-limit` يعمل داخل كل نسخة من الـWorker (كما كان على Vercel).
- ملف `src/middleware.ts` يعمل لكن Next 16 يسمّيه الآن `proxy` ويطبع تحذيراً وقت البناء. التحويل ممكن لاحقاً بـ `npx @next/codemod@canary middleware-to-proxy .`.
- **ملف `src/middleware.ts` ابقَ عليه ولا تحوّله إلى `proxy.ts`:** Next 16 يطبع تحذير «deprecated» فقط، أما `proxy.ts` فيعمل على Cloudflare بمسار Node تجريبي غير مدعوم رسمياً من OpenNext، وهذا الملف يحمي `/dashboard`.
- قواعد ESLint الجديدة الخاصة بـ React (مثل `set-state-in-effect`) مضبوطة كتحذيرات لا أخطاء.
