import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ResourceCard } from "@/components/marketing/resource-card";
import { getResources } from "@/lib/resources";
import { Download } from "lucide-react";
import { PageSections } from "@/components/page-sections/page-sections";

export const revalidate = 300;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: "FreeTools" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/free-tools",
    keywords: KEYWORDS.tools,
    locale,
  });
}

export default async function ResourcesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "FreeTools" });
  const resources = await getResources();

  return (
    <>
      <SiteHeader />
      {/* Custom sections can be added around this content: dashboard → Pages. */}
      <PageSections
        page="free-tools"
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
                    icon={Download}
                    title={t("title")}
                    subtitle={t("subtitle")}
                    align="start"
                  />
                </div>

                <div className="mt-10">
                  {resources.length === 0 ? (
                    <div className="card-surface">
                      <EmptyState
                        icon={Download}
                        title={t("emptyTitle")}
                        description={t("emptyDescription")}
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
            </>
          ),
        }}
      />
      <SiteFooter />
    </>
  );
}
