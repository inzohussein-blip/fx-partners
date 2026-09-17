import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/jsonld";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, SITE } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { getOperator, missingFields } from "@/lib/operator";
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
  const t = await getTranslations({ locale, namespace: "About" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/about",
    keywords:
      locale === "ar"
        ? ["من نحن", "FX Partners", "وكيل ماستر", "master ib", "سياسة التحرير"]
        : ["about FX Partners", "master IB", "introducing broker", "editorial policy"],
    locale,
  });
}

/**
 * What we are, next to what we are not — the distinction the whole site rests
 * on. Both lists are numbered keys rather than an array of strings so the
 * translator sees each line as its own unit.
 */
const WE_ARE = ["weAre1", "weAre2", "weAre3", "weAre4"] as const;
const WE_ARE_NOT = ["weAreNot1", "weAreNot2", "weAreNot3", "weAreNot4"] as const;

/**
 * The editorial rules. Every one of these is enforced in the code that renders
 * the directory, not a statement of intent — which is the only reason it is
 * worth publishing.
 */
const POLICY = [1, 2, 3, 4, 5] as const;

/** The bold run inside "how we get paid" — the one phrase that must stand out. */
function Emphasis(chunks: React.ReactNode) {
  return <strong className="text-fg">{chunks}</strong>;
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });
  const lang = locale === "en" ? "en" : "ar";

  // Who operates the site. Owner-supplied and empty by default: a placeholder
  // legal name is worse than a blank one, because a blank is obviously missing
  // and a placeholder looks like an answer.
  const company = await getOperator();
  const missing = missingFields(company);

  const facts = [
    { label: t("legalName"), value: company.legal_name },
    { label: t("founded"), value: company.founded },
    { label: t("location"), value: company.location },
    { label: t("registration"), value: company.registration },
    { label: t("email"), value: company.email },
  ].filter((f) => f.value.length > 0);

  const base = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: lang === "ar" ? `${base}/about` : `${base}/en/about`,
    name: `${t("crumb")} — ${SITE.name}`,
    description: SITE.description[lang],
    inLanguage: lang,
    mainEntity: { "@id": `${base}/#organization` },
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <section className="hero-glow">
        <Container className="max-w-3xl py-14">
          <Breadcrumbs items={[{ label: t("crumb") }]} />
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-snug text-fg sm:text-4xl">
            {t("h1")}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            {SITE.description[lang]}
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="max-w-3xl">
          {/* ---- Are / are not ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-fg">
                <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                {t("weAreTitle")}
              </h2>
              <ul className="mt-4 space-y-3">
                {WE_ARE.map((key) => (
                  <li key={key} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/70" aria-hidden />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-fg">
                <X className="h-4 w-4 text-rose-400" aria-hidden />
                {t("weAreNotTitle")}
              </h2>
              <ul className="mt-4 space-y-3">
                {WE_ARE_NOT.map((key) => (
                  <li key={key} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/70" aria-hidden />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---- How we get paid ---- */}
          <div className="card-surface mt-10 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <Coins className="h-5 w-5 text-brand-300" aria-hidden />
              {t("earnTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {t.rich("earnBody1", { b: Emphasis })}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{t("earnBody2")}</p>
          </div>

          {/* ---- Editorial policy ---- */}
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <ScrollText className="h-5 w-5 text-brand-300" aria-hidden />
              {t("policyTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{t("policyLead")}</p>
            <div className="mt-6 space-y-4">
              {POLICY.map((n) => (
                <div key={n} className="card-surface p-5">
                  <h3 className="flex items-start gap-3 text-sm font-bold text-fg">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-xs sm:text-[11px] font-extrabold text-brand-300">
                      {n}
                    </span>
                    {t(`policy${n}Title`)}
                  </h3>
                  <p className="mt-2 ps-9 text-sm leading-relaxed text-slate-400">
                    {t(`policy${n}Body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Who operates this site ----
              Always rendered, never hidden when empty. The privacy policy and
              the terms both say the controller and the governing law are "the
              entity named on the About page"; if this section disappears when
              unfilled, those clauses point at nothing and the reader has no
              way to tell that something is missing rather than absent by
              design. So the heading stands either way, and says which it is. */}
          <div className="card-surface mt-12 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <Building2 className="h-5 w-5 text-brand-300" aria-hidden />
              {t("companyTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("companyIntro")}</p>

            {facts.length > 0 && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-slate-500">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-200">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {missing.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4">
                <p className="text-sm font-semibold text-amber-300">
                  {t("companyPendingTitle")}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {t("companyPendingBody")}
                </p>
              </div>
            )}
          </div>

          {/* ---- Contact ---- */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {t("ctaContact")}
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-fg/15 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-fg/5"
            >
              {t("ctaDirectory")}
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
            </Link>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-slate-500">{t("risk")}</p>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
