import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpreadsHeatmap } from "@/components/brokers/spreads-heatmap";
import { getBrokerSpreads } from "@/lib/spreads";
import { getContent, contentKeyFor } from "@/lib/content";
import { Gauge } from "lucide-react";
import { MyfxbookFrame, MyfxbookWidget } from "@/components/myfxbook-widget";
import { MYFXBOOK_OUTLOOK, MYFXBOOK_SPREADS_SRC } from "@/lib/myfxbook";
import { PageSections } from "@/components/page-sections/page-sections";

export const revalidate = 300; // ISR: cache 5 min

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "SpreadsPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/spreads",
    keywords: KEYWORDS.spreads,
    locale,
  });
}

export default async function SpreadsPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SpreadsPage" });
  const rows = await getBrokerSpreads();
  const copy = await getContent(contentKeyFor("page.spreads", locale), {
    title: t("title"),
    subtitle: t("subtitle"),
  });

  return (
    <>
      <SiteHeader />
      {/* Custom sections can be added around this content: dashboard → Pages. */}
      <PageSections
        page="spreads"
        locale={locale}
        builtins={{
          content: (
            <>
            <section className="py-14">
              <Container>
                <Breadcrumbs items={[{ label: t("crumb") }]} />
                <div className="mt-6">
                  <SectionHeading
                    as="h1"
                    eyebrow={t("eyebrow")}
                    icon={Gauge}
                    title={copy.title}
                    subtitle={copy.subtitle}
                    align="start"
                  />
                </div>
                <section className="card-surface mt-10 p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-fg">{t("liveTitle")}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t("liveIntro")}</p>
                  <div className="mt-4">
                    <MyfxbookFrame
                      src={MYFXBOOK_SPREADS_SRC}
                      height={640}
                      title={t("liveTitle")}
                      credit="Live Forex Spreads"
                      creditHref="https://www.myfxbook.com/forex-broker-spreads"
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{t("liveNote")}</p>
                </section>

                <section className="mt-10">
                  <h2 className="mb-4 text-lg font-semibold text-fg">{t("tableTitle")}</h2>
                  <SpreadsHeatmap rows={rows} />
                </section>

                <section className="card-surface mt-10 p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-fg">{t("outlookTitle")}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t("outlookIntro")}</p>
                  <div className="mt-4">
                    <MyfxbookWidget html={MYFXBOOK_OUTLOOK} height={330} title={t("outlookTitle")} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{t("outlookNote")}</p>
                </section>
              </Container>
            </section>
            </>
          ),
        }}
      />
      <SiteFooter />
    </>
  );
}
