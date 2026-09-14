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

export const revalidate = 300; // ISR: cache 5 min

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "SpreadsPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/spreads",
    keywords: KEYWORDS.spreads,
    locale,
  });
}

export default async function SpreadsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
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
          <div className="mt-10">
            <SpreadsHeatmap rows={rows} />
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
