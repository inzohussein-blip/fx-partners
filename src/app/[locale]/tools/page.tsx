import type { Metadata } from "next";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { ToolsTabs } from "@/components/marketing/tools-tabs";
import { Wrench } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    title: "حاسبات التداول — اللوت والهامش وقيمة النقطة",
    description:
      "حاسبة الأرباح، حاسبة المخاطرة وقيمة النقطة، حاسبة الهامش، مقارنة العمولات، ومحاكي الأداء — أدوات المتداول كاملة بالعربية ومجاناً.",
    path: "/tools",
    keywords: KEYWORDS.tools,
    locale,
  });
}

export default function ToolsPage() {
  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Wrench className="h-3.5 w-3.5" aria-hidden />
            أدوات المتداول
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-white sm:text-5xl">
            حاسبات وأدوات التداول
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            كل ما يحتاجه المتداول لإدارة المخاطر واتخاذ القرار — مجاناً وفي مكان واحد.
          </p>
        </Container>
      </section>

      <ToolsTabs />

      <SiteFooter />
    </>
  );
}
