import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedBrokers } from "@/lib/published-brokers";
import { populatedCategories } from "@/lib/best-for";
import { Trophy, ArrowLeft } from "lucide-react";

/**
 * The "best for X" row on the homepage and the comparison page.
 *
 * Category pages are the highest-intent surface the directory has, and they
 * earn nothing if the only way in is a search engine that has not found them
 * yet. This is the internal link that gets them crawled, and the shortcut for
 * a reader who already knows what they need.
 *
 * It renders nothing at all when no category has a qualifying broker, which
 * is the same rule the pages and the sitemap follow — so the site never shows
 * a link to a list that would 404.
 */
export async function BestForStrip({ locale, limit = 4 }: { locale: string; limit?: number }) {
  const t = await getTranslations({ locale, namespace: "BestFor" });
  const lists = populatedCategories(await getPublishedBrokers()).slice(0, limit);
  if (lists.length === 0) return null;

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t("indexCrumb")}
          icon={Trophy}
          title={t("indexTitle")}
          subtitle={t("indexLead")}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lists.map(({ category, brokers }) => (
            <Link
              key={category.slug}
              href={`/best/${category.slug}`}
              className="card-surface group flex flex-col p-5 transition hover:border-brand-400/40"
            >
              <span className="text-xs font-medium text-brand-200">
                {t("brokerCount", { count: brokers.length })}
              </span>
              <h3 className="mt-2 flex-1 font-bold leading-snug text-fg group-hover:text-brand-200">
                {t(`${category.slug}Title`)}
              </h3>
              {/* The current leader, named. It is the answer the reader wants,
                  and it is the strongest reason to follow the link. */}
              <span className="mt-4 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-brand-300">
                {brokers[0].name}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/best"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-fg/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-fg/5"
          >
            {t("indexTitle")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}
