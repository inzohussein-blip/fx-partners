import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS, SITE } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/components/marketing/hero";
import { BrokerNetwork } from "@/components/marketing/broker-network";
import { TopRatedBrokers } from "@/components/marketing/top-rated-brokers";
import { CompareTeaser } from "@/components/marketing/compare-teaser";
import { LatestReviews } from "@/components/marketing/latest-reviews";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ToolsTabs } from "@/components/marketing/tools-tabs";
import { BestForStrip } from "@/components/marketing/best-for-strip";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { EditableText } from "@/components/admin-edit/editable-text";
import { ArrowLeft } from "lucide-react";

/**
 * Homepage — one deliberate narrative, not a pile of sections:
 *   identity & proof (hero) → who we connect to → the product (ratings,
 *   comparison, reviews) → how the master-IB model works → why us → tools →
 *   voices → objections → act.
 *
 * Sections deliberately kept off this page live on as components: the top
 * market ticker (the hero carries its own), the partner logo marquee (the
 * broker network band covers it), the standalone stats band (the hero chips
 * carry those figures), the 3-step starter (folded into How-it-works), plus
 * instruments, the market chart, about, team and contact — each of which
 * lengthened the page without moving a visitor forward.
 */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const lang = locale === "en" ? "en" : "ar";
  return pageMeta({
    title:
      lang === "ar"
        ? "مقارنة شركات التداول المرخّصة وبرنامج وكلاء IB | FX Partners"
        : "Compare licensed brokers and join the IB network | FX Partners",
    description: SITE.description[lang],
    path: "/",
    keywords: KEYWORDS.home,
    locale,
  });
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();

  const ctaFallback = {
    heading: t("Cta.heading"),
    subheading: t("Cta.subheading"),
    button: t("Cta.button"),
  };
  const cta =
    locale === "ar" ? await getContent("home.cta", ctaFallback) : ctaFallback;

  return (
    <>
      <SiteHeader />

      {/* 1 — Identity + the comparison proof, with its own live ticker */}
      <Hero locale={locale} />

      {/* 2 — Who we connect you to */}
      <BrokerNetwork />

      {/* 3 — The product: top-rated brokers */}
      <Reveal>
        <TopRatedBrokers />
      </Reveal>

      {/* 4 — The primary action: compare two brokers */}
      <BestForStrip locale={locale} />

      <Reveal>
        <CompareTeaser />
      </Reveal>

      {/* 5 — Social proof from real reviews */}
      <Reveal>
        <LatestReviews />
      </Reveal>

      {/* 6 — How the master-IB model works (the identity explainer) */}
      <Reveal>
        <HowItWorks />
      </Reveal>

      {/* The six agent-programme features that stood here now live only on
          /affiliates: the homepage speaks to the trader first, and the
          how-it-works section above already carries the one agent card. */}

      {/* 8 — Interactive tools */}
      <ToolsTabs />

      {/* 9 — Voices */}
      <Reveal>
        <Testimonials />
      </Reveal>

      {/* 10 — Objection handling */}
      <Reveal>
        <Faq namespace="FaqHome" />
      </Reveal>

      {/* 11 — Act */}
      <section className="py-16">
        <Container>
          <div className="card-surface relative isolate overflow-hidden p-10 text-center sm:p-16">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(70% 90% at 50% 0%, rgba(0,144,252,0.28) 0%, transparent 62%), radial-gradient(60% 80% at 15% 100%, rgba(84,216,240,0.20) 0%, transparent 66%)",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(84,216,240,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(84,216,240,0.06) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
                maskImage:
                  "radial-gradient(70% 70% at 50% 40%, #000 0%, transparent 82%)",
                WebkitMaskImage:
                  "radial-gradient(70% 70% at 50% 40%, #000 0%, transparent 82%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-3xl font-bold text-fg sm:text-4xl">
                <EditableText contentKey="home.cta" field="heading" label="عنوان الدعوة">
                  {cta.heading}
                </EditableText>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                <EditableText
                  contentKey="home.cta"
                  field="subheading"
                  label="وصف الدعوة"
                  multiline
                >
                  {cta.subheading}
                </EditableText>
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/compare" className="text-base">
                  {t("Cta.buttonTrader")}
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                </Button>
                <Button href="/affiliates" variant="secondary" className="text-base">
                  {cta.button}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
