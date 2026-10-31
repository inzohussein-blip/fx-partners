# خطة الطوارئ: تشغيل الموقع بدون Vercel

إذا توقف Vercel، يمكنك تشغيل الموقع نفسه من **جهازك** أو من **سيرفر مستأجر**، ويبقى العنوان `partners-fx.trade` كما هو.

**البيانات لا تضيع:** الشركات والمستخدمون والمقالات والشعارات كلها في Supabase، وهي منفصلة عن Vercel.

> **قاعدة أمان:** الملف `.env.emergency` فيه مفاتيح سرية. لا ترفعه إلى GitHub ولا ترسله لأحد.
> المستودع يتجاهله تلقائياً.

---

## أولاً: التحضير (مرة واحدة الآن، والموقع يعمل)

### 1) ثبّت البرامج
- **Docker Desktop**: من docker.com، يعمل على ويندوز وماك ولينكس. هذه هي الطريقة الموصى بها.
- **Git**: لتنزيل المشروع.

ثم نزّل المشروع:
```bash
git clone https://github.com/inzohussein-blip/fx-partners.git
cd fx-partners
```

### 2) جهّز ملف المفاتيح
```bash
cp .env.emergency.example .env.emergency
```
افتح `.env.emergency` واملأه بالقيم نفسها الموجودة في:
**Vercel → fx-partners → Settings → Environment Variables**.

أهمها:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `TELEGRAM_BOT_TOKEN`

### 3) أنشئ «النفق» في Cloudflare (Cloudflare Tunnel، مجاني)
النفق يوصل زوار نطاقك إلى جهازك أو سيرفرك دون فتح منافذ ودون إعدادات راوتر.

1. ادخل Cloudflare → **Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**.
2. اختر **Cloudflared**، وسمّه `partners-fx-backup`.
3. انسخ **الـToken** (النص الطويل بعد `--token`) وضعه في `.env.emergency`:
   ```
   CLOUDFLARE_TUNNEL_TOKEN=الـtoken_هنا
   ```
4. في **Public Hostname** أضف عنواناً **للتجربة فقط** الآن:
   - Subdomain: `backup`، Domain: `partners-fx.trade`
   - Service: النوع `HTTP` والعنوان `web:3000`
     (إذا شغّلت بدون Docker اكتب `localhost:3000`)

> لا تضع النطاق الرئيسي الآن، لأنه مربوط بـVercel. نغيّره فقط عند الطوارئ (الخطوة «ثانياً»).

### 4) جرّب التشغيل مرة
```bash
docker compose --env-file .env.emergency --profile tunnel up -d --build
```
- البناء الأول يأخذ من 3 إلى 6 دقائق.
- افتح `https://backup.partners-fx.trade`، يجب أن يظهر الموقع.
- للإيقاف بعد التجربة:
  ```bash
  docker compose --env-file .env.emergency --profile tunnel down
  ```

> **تسجيل الدخول في التجربة:** أضف `https://backup.partners-fx.trade/**` إلى
> Supabase → Authentication → URL Configuration → Redirect URLs.
> بدونه يعمل الموقع، لكن روابط تأكيد البريد تعيدك إلى النطاق الرئيسي.

---

## ثانياً: عند توقف Vercel فعلاً

1. شغّل الموقع (إن لم يكن شغّالاً):
   ```bash
   cd fx-partners
   git pull
   docker compose --env-file .env.emergency --profile tunnel up -d --build
   ```
2. في Cloudflare → **DNS**: احذف سجلات النطاق الرئيسي `partners-fx.trade` و`www` التي تشير إلى Vercel.
3. في Zero Trust → Tunnels → `partners-fx-backup` → **Public Hostname** أضف:
   - (فارغ) `partners-fx.trade` ← `HTTP` `web:3000`
   - `www` `partners-fx.trade` ← `HTTP` `web:3000`

   Cloudflare ينشئ سجلات DNS الجديدة وحده.
4. خلال دقائق يعمل الموقع من جهازك أو سيرفرك على العنوان نفسه.

ما يعمل كالعادة:
- كل الصفحات، ولوحة التحكم، وتسجيل الدخول؛
- تنبيهات الأخبار، لأنها تُرسل من GitHub إلى النطاق؛
- دولة الزائر في النقرات؛
- التخزين المؤقت للصفحات.

ما لا يعمل:
- إحصائيات Vercel فقط، وهي لا تؤثر على الموقع.

---

## ثالثاً: العودة إلى Vercel
1. في Tunnels احذف الـPublic Hostname للنطاق الرئيسي و`www`.
2. في Vercel → Settings → Domains، اضغط **Refresh** بجانب النطاق، واتبع السجلات التي يطلبها.
   عادةً `A` للنطاق الرئيسي و`CNAME` لـ`www`، مع **سحابة رمادية** (DNS only) كما كانت.
3. بعد أن يعمل الموقع على Vercel، أوقف نسخة الطوارئ:
   ```bash
   docker compose --env-file .env.emergency --profile tunnel down
   ```

---

## سيرفر مستأجر بدل جهازك
أي سيرفر Ubuntu بـ2GB ذاكرة على الأقل يكفي، مثل Hetzner أو DigitalOcean (حوالي 5 دولارات شهرياً).

1. ثبّت Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
2. نفّذ خطوات «أولاً» نفسها على السيرفر: `git clone`، ثم `.env.emergency`، ثم التشغيل.
3. النفق يعمل على السيرفر أيضاً، فلا تحتاج فتح منافذ.
   الموقع لا يستمع إلا على `127.0.0.1:3000`، فلا يصل أحد إلى السيرفر مباشرة.

`restart: unless-stopped` يعيد تشغيل الموقع تلقائياً بعد إعادة تشغيل الجهاز أو السيرفر.

### تحديث نسخة الطوارئ بآخر تعديلات الموقع
```bash
git pull
docker compose --env-file .env.emergency --profile tunnel up -d --build
```

---

## بدون Docker (ماك أو لينكس، يحتاج Node.js 22)
```bash
./scripts/emergency-run.sh
```
السكربت يقرأ `.env.emergency`، ويبني الموقع، ويشغّله على المنفذ 3000.

بعدها شغّل النفق في نافذة ثانية:
```bash
cloudflared tunnel run --token <CLOUDFLARE_TUNNEL_TOKEN>
```
واجعل الـService في Cloudflare: `HTTP` `localhost:3000`.

> لا تضبط `HOSTNAME` على عنوان محدد مثل `127.0.0.1`. ذلك يجعل تحويل اللغة يدور في حلقة.
> السكربت يضبطه على `0.0.0.0`.

---

## مشاكل شائعة
| المشكلة | الحل |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL ... missing` أثناء البناء | املأ `.env.emergency`، وتأكد أنك تستخدم `--env-file .env.emergency`. |
| الموقع يفتح لكن الشركات فارغة | المفتاح `NEXT_PUBLIC_SUPABASE_ANON_KEY` خاطئ أو ناقص. |
| تسجيل الدخول يعيدك إلى صفحة خطأ | أضف عنوان الطوارئ إلى Redirect URLs في Supabase. |
| `docker: command not found` | ثبّت Docker Desktop وشغّله. |
| النفق لا يعمل | تأكد أن الـToken صحيح، وأن الـService هو `web:3000` مع Docker، أو `localhost:3000` بدونه. |
