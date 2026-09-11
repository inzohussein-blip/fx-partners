import type { Metadata } from "next";
import { pageMeta, SITE } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { getContent } from "@/lib/content";
import { getSiteUrl } from "@/lib/utils";
import {
  Check,
  X,
  Coins,
  ScrollText,
  Building2,
  Mail,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    title: "من نحن — وسيط شراكة ووكيل ماستر، لا شركة تداول",
    description:
      "من يقف خلف FX Partners، وكيف نكسب، وكيف نقرّر ما يُعرض على الموقع: منهجية التراخيص، سياسة التقييمات، وما الذي لا نكتبه أبداً عن شركة لم نتحقّق منها.",
    path: "/about",
    keywords: ["من نحن", "FX Partners", "وكيل ماستر", "master ib", "سياسة التحرير"],
    locale,
  });
}

/** What we are, next to what we are not — the distinction the whole site rests on. */
const WE_ARE = [
  "وسيط شراكة ووكيل ماستر (Master IB) متعاقد مع شركات تداول مرخّصة.",
  "نتفاوض على شروط لمجموعة، فيحصل الوكيل والمتداول على ما لا يحصل عليه فرد وحده.",
  "ندير شبكة وكلاء فرعيين (Sub-IB) ونوفّر لهم الدعم التشغيلي والمتابعة.",
  "ننشر مقارنة بين الشركات وتراخيصها وشروطها بالعربية.",
];

const WE_ARE_NOT = [
  "لسنا شركة تداول (broker) ولا وسيط تنفيذ.",
  "لا نستقبل إيداعات ولا نحتفظ بأموال العملاء.",
  "لا نفتح حسابات تداول ولا ننفّذ صفقات.",
  "لا نقدّم نصيحة استثمارية ولا توصيات تداول.",
];

/**
 * The editorial rules. Every one of these is enforced in the code that renders
 * the directory, not a statement of intent — which is the only reason it is
 * worth publishing.
 */
const POLICY = [
  {
    title: "الترخيص يتبع الكيان، لا الاسم التجاري",
    body: "معظم شركات التداول تعمل عبر عدّة كيانات قانونية تحت جهات رقابية مختلفة. نعرض الترخيص منسوباً إلى كيانه، لأن الترخيص الذي يحمي العميل هو ترخيص الكيان الذي يُفتح حسابه لديه — لا الأقوى في القائمة.",
  },
  {
    title: "الحقل غير المتحقَّق منه يبقى فارغاً",
    body: "إن لم نتحقّق من سبريد أو بونص أو حد أدنى للإيداع، نتركه فارغاً. لا نضع رقماً تقديرياً ولا شرطة تُقرأ كأنها بيان. الواجهة تُخفي الحقول الفارغة بدل ملئها.",
  },
  {
    title: "التقييمات من مراجعات حقيقية فقط",
    body: "التقييم ومجموع المراجعات يُبنيان من مراجعات مستخدمين حقيقيين، ولا يُكتبان يدوياً. الشركة التي لا مراجعات لها تظهر «لم تُقيَّم بعد» — لا صفراً، لأن الصفر يُقرأ كتقييم سيئ.",
  },
  {
    title: "لا شهادات ولا شركاء من نسج الخيال",
    body: "لا ننشر آراء عملاء مخترَعة ولا أسماء شركات لسنا متعاقدين معها. القسم الذي لا يملك محتوى حقيقياً لا يظهر أصلاً.",
  },
  {
    title: "الشركة المتعاقدة موسومة بوضوح",
    body: "الشركات التي لدينا معها اتفاقية تحمل وسم «شريك معتمد». ندرج أيضاً شركات لا نتعاقد معها، وتظهر بلا وسم — حتى تكون المقارنة مقارنة، لا قائمة عملاء.",
  },
];

export default async function AboutPage() {
  // Company facts are owner-supplied. Empty by default: a placeholder legal
  // name or address on an "about" page is worse than no section at all.
  const company = await getContent("page.about.company", {
    legal_name: "",
    founded: "",
    location: "",
    registration: "",
    email: "",
  });

  const facts = [
    { label: "الاسم القانوني", value: company.legal_name },
    { label: "سنة التأسيس", value: company.founded },
    { label: "المقرّ", value: company.location },
    { label: "رقم التسجيل", value: company.registration },
  ].filter((f) => f.value.trim().length > 0);

  const base = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${base}/about`,
    name: "من نحن — FX Partners",
    description: SITE.description.ar,
    inLanguage: "ar",
    mainEntity: { "@id": `${base}/#organization` },
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-glow">
        <Container className="max-w-3xl py-14">
          <Breadcrumbs items={[{ label: "من نحن" }]} />
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            من نحن
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-snug text-white sm:text-4xl">
            وسيط شراكة ووكيل ماستر — لا شركة تداول
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            {SITE.description.ar}
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="max-w-3xl">
          {/* ---- Are / are not ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                ما نحن
              </h2>
              <ul className="mt-4 space-y-3">
                {WE_ARE.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/70" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <X className="h-4 w-4 text-rose-400" aria-hidden />
                ما لسنا
              </h2>
              <ul className="mt-4 space-y-3">
                {WE_ARE_NOT.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/70" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---- How we get paid ---- */}
          <div className="card-surface mt-10 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Coins className="h-5 w-5 text-brand-300" aria-hidden />
              كيف نكسب
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              تدفع لنا شركات التداول عمولة عن نشاط العملاء الذين يفتحون حساباتهم
              عبرنا. هذه العمولة تأتي من فرق السعر أو العمولة التي تدفعها الشركة
              أصلاً — <strong className="text-white">لا كرسم إضافي عليك</strong>، ولا
              ترفع تكلفة تداولك.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              وهذا يعني أيضاً أن لدينا مصلحة مالية في بعض الشركات المعروضة. لذلك
              نوسم الشركة المتعاقدة بوضوح، وندرج شركات لا نتعاقد معها، ونترك
              التقييم للمراجعات لا لنا. القاعدة التي نلتزم بها: أن تعرف بأي صفة
              نتحدّث قبل أن تقرّر.
            </p>
          </div>

          {/* ---- Editorial policy ---- */}
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <ScrollText className="h-5 w-5 text-brand-300" aria-hidden />
              كيف نقرّر ما يُعرض
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              خمس قواعد مطبَّقة في الكود الذي يبني الصفحات، لا نيّات مكتوبة.
            </p>
            <div className="mt-6 space-y-4">
              {POLICY.map((p, i) => (
                <div key={p.title} className="card-surface p-5">
                  <h3 className="flex items-start gap-3 text-sm font-bold text-white">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-[11px] font-extrabold text-brand-300">
                      {i + 1}
                    </span>
                    {p.title}
                  </h3>
                  <p className="mt-2 ps-9 text-sm leading-relaxed text-slate-400">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Company facts (only what the owner has filled in) ---- */}
          {facts.length > 0 && (
            <div className="card-surface mt-12 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Building2 className="h-5 w-5 text-brand-300" aria-hidden />
                بيانات الشركة
              </h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-slate-500">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-200">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* ---- Contact ---- */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
            >
              <Mail className="h-4 w-4" aria-hidden />
              تواصل معنا
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5"
            >
              دليل الشركات
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
            </Link>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-slate-500">
            تحذير المخاطر: التداول بالرافعة المالية ينطوي على مخاطر خسارة رأس المال.
            المحتوى على هذا الموقع لأغراض إعلامية فقط وليس نصيحة استثمارية.
          </p>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
