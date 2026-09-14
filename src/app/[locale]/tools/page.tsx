import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContent, contentKeyFor } from "@/lib/content";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EditableText } from "@/components/admin-edit/editable-text";
import { ToolsTabs } from "@/components/marketing/tools-tabs";
import { Wrench } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ToolsPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/tools",
    keywords: KEYWORDS.tools,
    locale,
  });
}

export default async function ToolsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ToolsPage" });
  const key = contentKeyFor("page.tools", locale);
  const copy = await getContent(key, {
    title: t("title"),
    subtitle: t("subtitle"),
  });

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-8 text-center sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Wrench className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-4xl sm:leading-tight lg:text-5xl">
            <EditableText contentKey={key} field="title" label={t("editTitle")}>
              {copy.title}
            </EditableText>
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            <EditableText contentKey={key} field="subtitle" label={t("editSubtitle")} multiline>
              {copy.subtitle}
            </EditableText>
          </p>
        </Container>
      </section>

      <ToolsTabs showIntro={false} />

      <SiteFooter />
    </>
  );
}
