import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { ProfitCalculator } from "@/components/marketing/profit-calculator";
import { BrokerComparison } from "@/components/marketing/broker-comparison";
import { Backtest } from "@/components/marketing/backtest";
import { MarketTicker } from "@/components/marketing/market-ticker";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { Markets } from "@/components/marketing/markets";
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
} from "lucide-react";

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

  // Arabic keeps the CMS-editable content; English uses the message catalog.
  const heroFallback = {
    titleTop: t("Hero.titleTop"),
    titleAccent: t("Hero.titleAccent"),
    subtitle: t("Hero.subtitle"),
    cta: t("Common.startPartnership"),
  };
  const hero =
    locale === "ar" ? await getContent("home.hero", heroFallback) : heroFallback;

  const statsFallback = {
    partners: t("Stats.partners"),
    volume: t("Stats.volume"),
    countries: t("Stats.countries"),
    payout: t("Stats.payout"),
  };
  const stats =
    locale === "ar" ? await getContent("home.stats", statsFallback) : statsFallback;

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
    { label: t("Stats.partnersLabel"), value: stats.partners },
    { label: t("Stats.volumeLabel"), value: stats.volume },
    { label: t("Stats.countriesLabel"), value: stats.countries },
    { label: t("Stats.payoutLabel"), value: stats.payout },
  ];

  return (
    <>
      <SiteHeader />

      {/* Live ticker tape */}
      <MarketTicker />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint [background-size:44px_44px] opacity-40" />
        <Container className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {t("Hero.badge")}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              {hero.titleTop}{" "}
              <span className="text-gradient">{hero.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300">
              {hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button href="/login" className="text-base">
                {hero.cta}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              </Button>
              <Button href="/affiliates" variant="secondary" className="text-base">
                {t("Common.viewRates")}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label} className="card-surface p-5 text-center">
                <div dir="ltr" className="text-2xl font-bold text-brand-300 sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Trusted-by animated logo carousel */}
      <LogoCarousel partners={partners} />

      {/* Live market chart (TradingView Lightweight Charts) */}
      <Reveal>
        <Markets />
      </Reveal>

      {/* Features */}
      <Reveal>
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {t("Features.heading")}
            </h2>
            <p className="mt-4 text-slate-400">{t("Features.subheading")}</p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.key}
                className="card-surface group p-6 transition hover:border-brand-500/30"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 transition group-hover:bg-brand-500/20">
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

      {/* Profit calculator */}
      <Reveal>
        <ProfitCalculator />
      </Reveal>

      {/* Multi-step broker comparison */}
      <Reveal>
        <BrokerComparison />
      </Reveal>

      {/* Historical backtest simulator */}
      <Reveal>
        <Backtest />
      </Reveal>

      {/* About */}
      <Reveal>
        <About />
      </Reveal>

      {/* Team */}
      <Reveal>
        <Team />
      </Reveal>

      {/* Testimonials */}
      <Reveal>
        <Testimonials />
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <Faq />
      </Reveal>

      {/* Contact */}
      <Reveal>
        <Contact />
      </Reveal>

      {/* CTA */}
      <section className="py-12">
        <Container>
          <div className="card-surface relative overflow-hidden p-10 text-center sm:p-16">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {t("Cta.heading")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                {t("Cta.subheading")}
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/login" className="text-base">
                  {t("Cta.button")}
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
