import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ResourceCard } from "@/components/marketing/resource-card";
import { getResources } from "@/lib/resources";
import { Download } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "أدوات ومؤشرات تداول مجانية",
  description:
    "حمّل مؤشرات MetaTrader وقوالب التحليل والكتب التعليمية مجاناً — أدوات حصرية من FX Partners لمساعدتك على التداول باحتراف.",
};

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container>
          <Breadcrumbs items={[{ label: "الأدوات المجانية" }]} />
          <div className="mt-6">
            <SectionHeading
              eyebrow="مكتبة الأدوات"
              icon={Download}
              title="أدوات ومؤشرات تداول مجانية"
              subtitle="مؤشرات MetaTrader، قوالب تحليل، وكتب تعليمية — فعّلها مجاناً بفتح حساب عبر روابطنا."
              align="start"
            />
          </div>

          <div className="mt-10">
            {resources.length === 0 ? (
              <div className="card-surface">
                <EmptyState
                  icon={Download}
                  title="لا توجد أدوات بعد"
                  description="تُضاف المؤشرات والقوالب والكتب من لوحة التحكم."
                />
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
