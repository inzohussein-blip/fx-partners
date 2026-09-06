import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { OrganizationJsonLd } from "@/components/organization-jsonld";
import { ToolsTabs } from "@/components/marketing/tools-tabs";
import { BrokerHighlight } from "@/components/marketing/broker-highlight";
import { MarketTicker } from "@/components/marketing/market-ticker";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { Instruments } from "@/components/marketing/instruments";
import { Steps } from "@/components/marketing/steps";
import { MarketsLazy as Markets } from "@/components/marketing/markets-lazy";
import { About } from "@/components/marketing/about";
import { Team } from "@/components/marketing/team";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { Contact } from "@/components/marketing/contact";
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Link2,
  Users,
  BarChart3,
  Globe,
  Trophy,
} from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { AnimatedStat } from "@/components/marketing/animated-counter";
import { EditableText } from "@/components/admin-edit/editable-text";

async function getPartners() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("partners")
      .select("id,name,logo_url")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations();

  const statsFallback = {
    partners: t("Stats.partners"),
    volume: t("Stats.volume"),
    countries: t("Stats.countries"),
    payout: t("Stats.payout"),
  };
  const stats =
    locale === "ar" ? await getContent("home.stats", statsFallback) : statsFallback;

  const ctaFallback = {
    heading: t("Cta.heading"),
    subheading: t("Cta.subheading"),
    button: t("Cta.button"),
  };
  const cta =
    locale === "ar" ? await getContent("home.cta", ctaFallback) : ctaFallback;

  const featuresFallback = {
    title: t("Features.heading"),
    subtitle: t("Features.subheading"),
  };
  const featuresCopy =
    locale === "ar" ? await getContent("home.features", featuresFallback) : featuresFallback;

  const partners = await getPartners();

  const features = [
    { icon: TrendingUp, key: "revenueShare" },
    { icon: Link2, key: "links" },
    { icon: BarChart3, key: "dashboard" },
    { icon: Wallet, key: "withdrawals" },
    { icon: ShieldCheck, key: "security" },
    { icon: Users, key: "multiTier" },
  ] as const;

  const statCards = [
    { label: t("Stats.partnersLabel"), value: stats.partners, icon: Users },
    { label: t("Stats.volumeLabel"), value: stats.volume, icon: BarChart3 },
    { label: t("Stats.countriesLabel"), value: stats.countries, icon: Globe },
    { label: t("Stats.payoutLabel"), value: stats.payout, icon: Trophy },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />

      {/* Live ticker tape */}
      <MarketTicker />

      {/* Hero — visual + copy + live ticker bar */}
      <Hero locale={locale} />

      {/* Social proof — trusted-by logo marquee */}
      <LogoCarousel partners={partners} />

      {/* Impact stats band */}
      <section className="ambient-section py-16">
        <span
          className="ambient inset-x-1/4 top-0 h-64"
          style={{ background: "radial-gradient(circle, rgba(0,140,255,0.28) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container>
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              <span className="h-px w-8 bg-brand-400/60" />
              أثرنا بالأرقام
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="card-surface group p-6 text-center transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                  <s.icon className="h-5 w-5" />
                </span>
                <AnimatedStat
                  value={s.value}
                  className="mt-4 block text-3xl font-extrabold text-gradient"
                />
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why choose us — features */}
      <Reveal>
      <section className="ambient-section py-16 sm:py-24">
        <span
          className="ambient -start-24 top-1/4 h-80 w-80"
          style={{ background: "radial-gradient(circle, rgba(0,209,230,0.22) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container>
          <SectionHeading
            eyebrow={t("Features.badge")}
            icon={Trophy}
            title={featuresCopy.title}
            subtitle={featuresCopy.subtitle}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.key}
                className="card-surface group p-6 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {t(`Features.${f.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {t(`Features.${f.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      </Reveal>

      {/* How to start — 3 steps. Kept high on the page: a visitor decides to
          join once the path to joining is obvious. */}
      <Reveal>
        <Steps />
      </Reveal>

      {/* What can be traded — asset-class grid */}
      <Reveal>
        <Instruments />
      </Reveal>

      {/* Live market chart (TradingView Lightweight Charts) */}
      <Reveal>
        <Markets />
      </Reveal>

      {/* Interactive tools (calculator / comparison / backtest) in tabs */}
      <ToolsTabs />

      {/* Top brokers directory carousel */}
      <Reveal>
        <BrokerHighlight />
      </Reveal>

      {/* Testimonials */}
      <Reveal>
        <Testimonials />
      </Reveal>

      {/* About */}
      <Reveal>
        <About />
      </Reveal>

      {/* Team */}
      <Reveal>
        <Team />
      </Reveal>

      {/* FAQ — objection handling, placed right before the closing CTA */}
      <Reveal>
        <Faq />
      </Reveal>

      {/* Contact */}
      <Reveal>
        <Contact />
      </Reveal>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="card-surface relative isolate overflow-hidden p-10 text-center sm:p-16">
            {/* Layered brand glow + fading grid, matching the hero treatment */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(70% 90% at 50% 0%, rgba(0,140,255,0.28) 0%, transparent 62%), radial-gradient(60% 80% at 15% 100%, rgba(0,209,230,0.20) 0%, transparent 66%)",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(0,209,230,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,209,230,0.06) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
                maskImage:
                  "radial-gradient(70% 70% at 50% 40%, #000 0%, transparent 82%)",
                WebkitMaskImage:
                  "radial-gradient(70% 70% at 50% 40%, #000 0%, transparent 82%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                <EditableText contentKey="home.cta" field="heading" label="عنوان الدعوة">
                  {cta.heading}
                </EditableText>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                <EditableText contentKey="home.cta" field="subheading" label="وصف الدعوة" multiline>
                  {cta.subheading}
                </EditableText>
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/login" className="text-base">
                  {cta.button}
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
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
