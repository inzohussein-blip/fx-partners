import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { getPublishedBrokers } from "@/lib/published-brokers";
import { populatedCategories } from "@/lib/best-for";
import { Trophy, ArrowLeft } from "lucide-react";

export const revalidate = 600;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "BestFor" });
  return pageMeta({
    title: t("indexMetaTitle"),
    description: t("indexMetaDescription"),
    path: "/best",
    locale,
  });
}

export default async function BestIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "BestFor" });
  const lists = populatedCategories(await getPublishedBrokers());

  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="max-w-3xl py-12">
          <Breadcrumbs items={[{ label: t("indexCrumb") }]} />
          <h1 className="mt-6 text-3xl font-extrabold leading-snug text-fg sm:text-4xl">
            {t("indexTitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{t("indexLead")}</p>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="max-w-3xl">
          {lists.length === 0 ? (
            // No invented lists while the directory is empty. The page says so
            // rather than showing eight links that all lead to a 404.
            <p className="card-surface p-10 text-center text-sm leading-relaxed text-slate-400">
              {t("indexEmpty")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lists.map(({ category, brokers }) => (
                <Link
                  key={category.slug}
                  href={`/best/${category.slug}`}
                  className="card-surface group flex flex-col p-5 transition hover:border-brand-400/40"
                >
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-brand-200">
                    <Trophy className="h-3.5 w-3.5" aria-hidden />
                    {t("brokerCount", { count: brokers.length })}
                  </span>
                  <h2 className="mt-2.5 font-bold leading-snug text-fg group-hover:text-brand-200">
                    {t(`${category.slug}Title`)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                    {t(`${category.slug}Description`)}
                  </p>
                  <span className="mt-4 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-brand-300">
                    {brokers[0].name}
                    <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/methodology"
              className="inline-flex min-h-6 items-center text-sm text-brand-300 underline underline-offset-2 hover:text-brand-200"
            >
              {t("methodologyLink")}
            </Link>
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
