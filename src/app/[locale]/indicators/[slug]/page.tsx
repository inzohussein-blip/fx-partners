import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { jsonLdScript } from "@/lib/jsonld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { TV_BASE } from "@/lib/tradingview";
import { INDICATORS, indicatorBySlug, pick, pickList } from "@/lib/indicators";
import { AlertTriangle, ExternalLink, Send } from "lucide-react";

/** Every guide is static; an unknown slug 404s. */
export function generateStaticParams() {
  return INDICATORS.map((i) => ({ slug: i.slug }));
}
export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const ind = indicatorBySlug(slug);
  if (!ind) return {};
  return pageMeta({
    title: pick(ind.name, locale),
    description: `${pick(ind.summary, locale)} ${pick(ind.when, locale)}`,
    path: `/indicators/${ind.slug}`,
    keywords: KEYWORDS.markets,
    locale,
    type: "article",
  });
}

// A public Telegram channel for release alerts, if one is set up.
const CHANNEL_URL = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL?.trim();

export default async function IndicatorPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const ind = indicatorBySlug(slug);
  if (!ind) notFound();
  const t = await getTranslations({ locale, namespace: "Indicators" });
  const name = pick(ind.name, locale);

  const facts = [
    { label: t("agency"), value: pick(ind.agency, locale) },
    { label: t("frequency"), value: pick(ind.frequency, locale) },
    { label: t("when"), value: pick(ind.when, locale) },
    { label: t("time"), value: pick(ind.time, locale) },
  ];

  // Built from the same strings the page shows, so the two never disagree.
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { q: t("whatTitle", { code: ind.code }), a: pick(ind.what, locale) },
      { q: t("faqWhen", { code: ind.code }), a: pick(ind.when, locale) },
      { q: t("faqTime", { code: ind.code }), a: pick(ind.time, locale) },
      { q: t("whyTitle"), a: pick(ind.why, locale) },
    ].map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  const related = ind.related.map(indicatorBySlug).filter((r) => r !== undefined);

  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faq) }} />
      <article className="py-14">
        <Container className="max-w-4xl">
          <Breadcrumbs items={[{ label: t("crumb"), href: "/indicators" }, { label: ind.code }]} />

          <header className="mt-6">
            <span dir="ltr" className="inline-block rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-200">
              {ind.code}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-fg sm:text-4xl">{name}</h1>
            <p className="mt-3 text-lg leading-relaxed text-slate-400">{pick(ind.summary, locale)}</p>
          </header>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="card-surface p-4">
                <dt className="text-xs text-slate-500">{f.label}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-fg">{t("whatTitle", { code: ind.code })}</h2>
            <p className="mt-3 leading-loose text-slate-300">{pick(ind.what, locale)}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-fg">{t("whyTitle")}</h2>
            <p className="mt-3 leading-loose text-slate-300">{pick(ind.why, locale)}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-fg">{t("watchTitle")}</h2>
            <ul className="mt-3 list-disc space-y-2 ps-6 leading-relaxed text-slate-300">
              {pickList(ind.watch, locale).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-slate-400">{t("affectsTitle")}</h3>
            <div className="mt-2 flex flex-wrap gap-2" dir="ltr">
              {ind.affects.map((a) => (
                <span key={a} className="rounded-full bg-fg/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {a}
                </span>
              ))}
            </div>
          </section>

          <section className="card-surface mt-10 p-5">
            <h2 className="text-lg font-bold text-fg">{t("officialTitle")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("officialBody")}</p>
            <a
              href={ind.official.url}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              {pick(ind.official.label, locale)}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </section>

          <section className="card-surface mt-6 p-4 sm:p-5">
            <h2 className="text-lg font-bold text-fg">{t("calendarTitle")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("calendarNote", { code: ind.code })}</p>
            <div className="mt-4">
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-events.js`}
                height={480}
                config={{
                  width: "100%",
                  height: "100%",
                  isTransparent: true,
                  importanceFilter: "0,1",
                  countryFilter: ind.tvCountry,
                }}
              />
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <AlertTriangle className="h-5 w-5 text-amber-300" aria-hidden />
              {t("tradeTitle")}
            </h2>
            <ul className="mt-3 list-disc space-y-2 ps-6 text-sm leading-relaxed text-slate-300">
              <li>{t("trade1")}</li>
              <li>{t("trade2")}</li>
              <li>{t("trade3")}</li>
            </ul>
            <div className="mt-4">
              <Button href="/spreads" variant="secondary">
                {t("tradeCta")}
              </Button>
            </div>
          </section>

          {CHANNEL_URL && (
            <section className="card-surface mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-bold text-fg">{t("alertsTitle")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("alertsBody")}</p>
              </div>
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                <Send className="h-4 w-4" aria-hidden />
                Telegram
              </a>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-fg">{t("relatedTitle")}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/indicators/${r.slug}`} className="card-surface block p-4 transition hover:border-brand-500/40">
                      <span dir="ltr" className="text-xs font-bold text-brand-200">{r.code}</span>
                      <span className="mt-1 block text-sm font-medium text-fg">{pick(r.name, locale)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/indicators" className="mt-4 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200">
                {t("allIndicators")}
              </Link>
            </section>
          )}

          <p className="mt-10 text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
        </Container>
      </article>
      <SiteFooter />
    </>
  );
}
