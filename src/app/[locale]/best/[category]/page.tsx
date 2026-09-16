import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { BestForList } from "@/components/brokers/best-for-list";
import { getPublishedBrokers } from "@/lib/published-brokers";
import { CATEGORIES, categoryBySlug, populatedCategories, selectFor } from "@/lib/best-for";
import { Trophy, Info, ScrollText } from "lucide-react";

export const revalidate = 600;

/**
 * Pre-render every category. A slug outside the taxonomy 404s rather than
 * rendering an empty "best for" page for whatever was typed in the URL.
 */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params: { locale, category },
}: {
  params: { locale: string; category: string };
}): Promise<Metadata> {
  if (!categoryBySlug(category)) return {};
  const t = await getTranslations({ locale, namespace: "BestFor" });
  return pageMeta({
    title: t(`${category}Title`),
    description: t(`${category}Description`),
    path: `/best/${category}`,
    locale,
  });
}

export default async function BestForPage({
  params: { locale, category: slug },
}: {
  params: { locale: string; category: string };
}) {
  setRequestLocale(locale);
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: "BestFor" });
  const all = await getPublishedBrokers();
  const brokers = selectFor(category, all);

  /**
   * A category with nothing in it is not a page.
   *
   * Rendering "best broker for scalping" over an empty list would be a promise
   * made to a search engine and broken for the reader who follows it, so an
   * unpopulated category 404s until the data supports it. The index page and
   * the sitemap apply the same rule, so nothing ever links here in that state.
   */
  if (brokers.length === 0) notFound();

  const base = getSiteUrl();
  const prefix = locale === "en" ? "/en" : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t(`${slug}Title`),
    description: t(`${slug}Description`),
    numberOfItems: brokers.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: brokers.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `${base}${prefix}/brokers/${b.slug}`,
    })),
  };

  // Every other populated list, so a reader who picked the wrong one can move
  // sideways rather than back out to the index.
  const others = populatedCategories(all).filter((x) => x.category.slug !== slug);

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-glow">
        <Container className="max-w-3xl py-12">
          <Breadcrumbs
            items={[{ label: t("indexCrumb"), href: "/best" }, { label: t(`${slug}Title`) }]}
          />
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            {t("brokerCount", { count: brokers.length })}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-snug text-fg sm:text-4xl">
            {t(`${slug}Title`)}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {t(`${slug}Description`)}
          </p>

          {/* The rule is stated on the page, not just applied to it. A ranked
              list without its criterion is an assertion; with it, it is a
              result the reader can check. */}
          <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-fg/10 bg-fg/[0.03] px-4 py-2.5 text-sm text-slate-300">
            <ScrollText className="h-4 w-4 shrink-0 text-brand-300" aria-hidden />
            {t("rankedBy", { rule: t(`${slug}Rule`) })}
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="max-w-3xl">
          {/* What the reader should know before acting on the order. */}
          <div className="card-surface flex gap-3 p-5">
            <Info className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
            <p className="text-sm leading-relaxed text-slate-300">{t(`${slug}Intro`)}</p>
          </div>

          <BestForList category={category} brokers={brokers} locale={locale} />

          <p className="mt-5 text-xs leading-relaxed text-slate-500">{t("unratedNote")}</p>

          <div className="mt-6">
            <Link
              href="/methodology"
              className="inline-flex min-h-6 items-center text-sm text-brand-300 underline underline-offset-2 hover:text-brand-200"
            >
              {t("methodologyLink")}
            </Link>
          </div>

          {others.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-fg">{t("otherLists")}</h2>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {others.map(({ category: c, brokers: bs }) => (
                  <Link
                    key={c.slug}
                    href={`/best/${c.slug}`}
                    className="card-surface flex items-center justify-between gap-3 p-4 transition hover:border-brand-400/40"
                  >
                    <span className="text-sm font-semibold text-fg">{t(`${c.slug}Title`)}</span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {t("brokerCount", { count: bs.length })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
