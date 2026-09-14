import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { HeadToHeadTable } from "@/components/brokers/head-to-head-table";
import { parsePair, pairSlug, getPairBrokers, getAllPairs } from "@/lib/broker-pairs";
import { isRated } from "@/lib/brokers";
import { getSiteUrl } from "@/lib/utils";
import { Scale } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

/**
 * One page per broker pair: /compare/vs/vantage-vs-xm.
 *
 * "X vs Y" is the query a trader types in the last minute before choosing, and
 * it was being served from /compare/vs?a=&b=, which is a single indexable URL
 * no matter how many pairs exist. Six published brokers make fifteen pages,
 * each with its own title, description, comparison and structured data.
 */
export async function generateMetadata({
  params,
}: {
  params: { pair: string; locale: string };
}): Promise<Metadata> {
  const parsed = parsePair(params.pair);
  if (!parsed) return { title: "مقارنة غير موجودة" };
  const [a, b] = await getPairBrokers(parsed[0], parsed[1]);
  if (!a || !b) return { title: "مقارنة غير موجودة" };

  /**
   * The canonical always names the sorted slug, never the URL that was
   * requested.
   *
   * The page below also redirects an unsorted slug, and a browser does follow
   * it — but because generateMetadata resolves first, the response has already
   * begun streaming, so the redirect is delivered inside the stream with a 200
   * rather than as a 307. A crawler therefore sees a complete page at the
   * unsorted address, which is precisely the duplicate these pages exist to
   * prevent. Pointing the canonical at the sorted slug consolidates it whether
   * or not the redirect is followed.
   */
  return pageMeta({
    title: `${a.name} أم ${b.name}؟ مقارنة مباشرة بين الشركتين`,
    description:
      `مقارنة ${a.name} و${b.name} جنباً إلى جنب: الجهات الرقابية، السبريد، ` +
      `الرافعة، البونصات، عمولة الوكيل والتقييمات — لتختار بينهما بمعلومات لا بانطباع.`,
    path: `/compare/vs/${pairSlug(parsed[0], parsed[1])}`,
    locale: params.locale,
    keywords: [
      `${a.name} أم ${b.name}`,
      `مقارنة ${a.name} و${b.name}`,
      `${a.name} vs ${b.name}`,
      "مقارنة شركات التداول",
    ],
  });
}

export default async function PairPage({
  params,
}: {
  params: { pair: string; locale: string };
}) {
  setRequestLocale(params.locale);
  const parsed = parsePair(params.pair);
  if (!parsed) notFound();

  // One pair, one URL: an unordered slug redirects to the canonical order
  // rather than serving the same comparison from a second address.
  const canonical = pairSlug(parsed[0], parsed[1]);
  if (canonical !== params.pair) redirect(`/compare/vs/${canonical}`);

  const [[a, b], pairs] = await Promise.all([
    getPairBrokers(parsed[0], parsed[1]),
    getAllPairs(),
  ]);
  if (!a || !b) notFound();

  const base = getSiteUrl();
  // An ItemList of the two products being compared is what lets this surface
  // as a comparison rather than a loose page mentioning two names.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${a.name} مقابل ${b.name}`,
    numberOfItems: 2,
    itemListElement: [a, b].map((brk, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: brk.name,
      url: `${base}/brokers/${brk.slug}`,
      ...(isRated(brk)
        ? {
            item: {
              "@type": "Product",
              name: brk.name,
              url: `${base}/brokers/${brk.slug}`,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: brk.rating.toFixed(1),
                reviewCount: brk.reviews_count,
                bestRating: 5,
                worstRating: 1,
              },
            },
          }
        : {}),
    })),
  };

  // Other pairs involving either broker — the internal links that let a
  // visitor (and a crawler) walk the whole comparison set.
  const related = pairs
    .filter((p) => p.slug !== canonical && (p.a === a.slug || p.b === a.slug || p.a === b.slug || p.b === b.slug))
    .slice(0, 8);

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero-glow">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "قارن الشركات", href: "/compare" },
              { label: `${a.name} و${b.name}` },
            ]}
          />
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            مقارنة مباشرة
          </span>
          <h1 className="mt-4 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-3xl sm:leading-tight lg:text-4xl">
            {a.name} أم {b.name}؟
          </h1>
          <p className="mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:text-lg">
            الشركتان جنباً إلى جنب: الجهات الرقابية، السبريد، الرافعة، البونصات
            والتقييمات. الحقول غير المتحقَّق منها تبقى فارغة بدل أن تُملأ بالتقدير.
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <HeadToHeadTable a={a} b={b} />

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-sm font-bold text-fg">مقارنات أخرى</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/compare/vs/${p.slug}`}
                    className="rounded-xl border border-fg/10 px-3 py-2 text-[13px] text-slate-300 transition hover:border-brand-400/50 hover:text-fg"
                  >
                    {p.aName} و{p.bName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link href="/compare" className="text-sm text-brand-300 hover:text-brand-200">
              ← العودة إلى دليل كل الشركات
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
