import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpreadsHeatmap } from "@/components/brokers/spreads-heatmap";
import { getBrokerSpreads } from "@/lib/spreads";
import { Gauge } from "lucide-react";

export const revalidate = 300; // ISR: cache 5 min

export const metadata: Metadata = {
  title: "مقارنة السبريد بين شركات التداول",
  description:
    "قارن السبريد الحقيقي لكل أداة (ذهب، فوركس، مؤشرات، عملات رقمية) عبر أفضل شركات التداول — جدول حراري يُظهر الأرخص فوراً.",
};

export default async function SpreadsPage() {
  const rows = await getBrokerSpreads();

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: "مقارنة السبريد" }]} />
          <div className="mt-6">
            <SectionHeading
              eyebrow="السبريد"
              icon={Gauge}
              title="مقارنة السبريد بين الشركات"
              subtitle="قارن السبريد لكل أداة عبر شركات التداول — الألوان نسبية لكل أداة، والأخضر هو الأرخص."
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
