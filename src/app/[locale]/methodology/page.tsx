import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, SITE } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { CATEGORIES } from "@/lib/best-for";
import { ScrollText, ArrowLeft } from "lucide-react";

/** Bump only when the wording below actually changes. */
const LAST_UPDATED = "2026-09-16";

/** Paragraph count per numbered section, matching the Methodology namespace. */
const SHAPE = [3, 3, 2, 2, 2, 2, 1] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Methodology" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/methodology",
    locale,
  });
}

export default async function MethodologyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const [t, tb] = await Promise.all([
    getTranslations({ locale, namespace: "Methodology" }),
    getTranslations({ locale, namespace: "BestFor" }),
  ]);
  const lang = locale === "en" ? "en" : "ar";
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar", {
    dateStyle: "long",
  }).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  const base = getSiteUrl();
  // Declared as an article so a crawler can attribute the methodology to the
  // organisation that follows it, rather than reading it as another page of
  // marketing copy.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t("h1"),
    description: t("metaDescription"),
    inLanguage: lang,
    dateModified: LAST_UPDATED,
    mainEntityOfPage: lang === "ar" ? `${base}/methodology` : `${base}/en/methodology`,
    publisher: { "@id": `${base}/#organization` },
    about: SITE.name,
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: t("crumb") }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-fg sm:text-4xl">{t("h1")}</h1>
          <p className="mt-3 text-sm text-slate-500">{t("lastUpdated", { date })}</p>
          <p className="mt-6 text-base leading-relaxed text-slate-300">{t("lead")}</p>

          <div className="mt-10 space-y-8">
            {SHAPE.map((paragraphs, i) => {
              const n = i + 1;
              return (
                <section key={n}>
                  <h2 className="text-lg font-semibold text-fg">{t(`s${n}Title`)}</h2>
                  {Array.from({ length: paragraphs }, (_, j) => (
                    <p key={j} className="mt-2 text-sm leading-relaxed text-slate-400">
                      {t(`s${n}p${j + 1}`)}
                    </p>
                  ))}
                </section>
              );
            })}
          </div>

          {/* The rule for every list, in one table. Generated from the same
              taxonomy the pages use, so it cannot drift from what they do. */}
          <div className="mt-12">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <ScrollText className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
              {tb("indexTitle")}
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-start text-sm">
                <tbody>
                  {CATEGORIES.map((c) => (
                    <tr key={c.slug} className="border-b border-fg/5 align-top">
                      <td className="py-3 pe-4">
                        <Link
                          href={`/best/${c.slug}`}
                          className="font-medium text-brand-300 underline underline-offset-2 hover:text-brand-200"
                        >
                          {tb(`${c.slug}Title`)}
                        </Link>
                      </td>
                      <td className="py-3 leading-relaxed text-slate-400">{tb(`${c.slug}Rule`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href="/best"
              className="mt-5 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              {tb("indexCrumb")}
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
