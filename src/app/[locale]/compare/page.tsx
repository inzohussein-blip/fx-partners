import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EditableText } from "@/components/admin-edit/editable-text";
import { getContent, contentKeyFor } from "@/lib/content";
import { getPublishedBrokers } from "@/lib/published-brokers";
import { BestForStrip } from "@/components/marketing/best-for-strip";
import { BrokerFinder } from "@/components/brokers/broker-finder";
import { BrokerDirectory } from "@/components/brokers/broker-directory";
import { HeadToHeadPicker } from "@/components/brokers/head-to-head-picker";
import { SpecsGrid } from "@/components/brokers/specs-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Scale, ListChecks } from "lucide-react";
import { isRated } from "@/lib/brokers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ComparePage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/compare",
    keywords: KEYWORDS.compare,
    locale,
  });
}


export default async function ComparePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ComparePage" });
  const key = contentKeyFor("page.compare", locale);
  const brokers = await getPublishedBrokers();
  const copy = await getContent(key, {
    title: t("title"),
    subtitle: t("subtitle"),
  });

  // ItemList structured data: tells a search engine (and an agent) that this
  // page *is* the broker directory and what is on it, in order — which is what
  // turns a "best brokers" query into a list result rather than a blue link.
  const base = getSiteUrl();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("listName"),
    numberOfItems: brokers.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: brokers.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `${base}/brokers/${b.slug}`,
      ...(isRated(b)
        ? {
            item: {
              "@type": "Product",
              name: b.name,
              url: `${base}/brokers/${b.slug}`,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: b.rating.toFixed(1),
                reviewCount: b.reviews_count,
                bestRating: 5,
                worstRating: 1,
              },
            },
          }
        : {}),
    })),
  };

  return (
    <>
      <SiteHeader />
      {brokers.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <section className="hero-glow">
        <Container className="py-9 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-4xl sm:leading-tight lg:text-5xl">
            <EditableText contentKey={key} field="title" label={t("editTitle")}>
              {copy.title}
            </EditableText>
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            <EditableText contentKey={key} field="subtitle" label={t("editSubtitle")} multiline>
              {copy.subtitle}
            </EditableText>
          </p>
        </Container>
      </section>

      {/* The guided finder sits above the directory, not inside it: someone who
          has never chosen a broker wants a few questions, and someone who has
          wants the full list. Both are on the page, in that order. */}
      {brokers.length > 0 && (
        <section className="pb-6">
          <Container>
            <BrokerFinder brokers={brokers} />
          </Container>
        </section>
      )}

      <section className="pb-24">
        <Container>
          {brokers.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              {t("empty")}{" "}
              <span className="text-brand-300">{t("emptyLink")}</span>.
            </div>
          ) : (
            /* On a phone the head-to-head picker filled the entire second
               screen before a single broker appeared. Someone who opens the
               directory wants the directory; picking two names to compare is
               the follow-up, so it moves below the list on small screens and
               keeps its place above on desktop, where both fit at once. */
            <div className="flex flex-col gap-6">
              {brokers.length >= 2 && (
                <div className="order-2 lg:order-1">
                  <HeadToHeadPicker
                    options={brokers.map((b) => ({ slug: b.slug, name: b.name }))}
                  />
                </div>
              )}
              <div className="order-1 lg:order-2">
                <BrokerDirectory brokers={brokers} />
              </div>
            </div>
          )}
        </Container>
      </section>

      <BestForStrip locale={locale} />

      {/* Quick operational-specs comparison grid */}
      {brokers.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading
              eyebrow={t("specsEyebrow")}
              icon={ListChecks}
              title={t("specsTitle")}
              subtitle={t("specsSubtitle")}
              align="start"
            />
            <div className="mt-10">
              <SpecsGrid brokers={brokers} />
            </div>
          </Container>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
