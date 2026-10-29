import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { INDICATORS, pick } from "@/lib/indicators";
import { Newspaper } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Indicators" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/indicators",
    keywords: KEYWORDS.markets,
    locale,
  });
}

export default async function IndicatorsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Indicators" });

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: t("crumb") }]} />
          <div className="mt-6">
            <SectionHeading
              as="h1"
              eyebrow={t("eyebrow")}
              icon={Newspaper}
              title={t("title")}
              subtitle={t("subtitle")}
              align="start"
            />
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((i) => (
              <li key={i.slug}>
                <Link
                  href={`/indicators/${i.slug}`}
                  className="card-surface flex h-full flex-col p-5 transition hover:border-brand-500/40"
                >
                  <span dir="ltr" className="self-start rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-200">
                    {i.code}
                  </span>
                  <h2 className="mt-3 font-bold text-fg">{pick(i.name, locale)}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{pick(i.summary, locale)}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {pick(i.frequency, locale)} · {pick(i.agency, locale)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-slate-500">{t("disclaimer")}</p>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
