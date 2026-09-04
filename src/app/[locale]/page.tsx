import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { OrganizationJsonLd } from "@/components/organization-jsonld";
import { ToolsTabs } from "@/components/marketing/tools-tabs";
import { BrokerHighlight } from "@/components/marketing/broker-highlight";
import { MarketTicker } from "@/components/marketing/market-ticker";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { Markets } from "@/components/marketing/markets";
import { About } from "@/components/marketing/about";
import { Team } from "@/components/marketing/team";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { Contact } from "@/components/marketing/contact";
import { LogoMark } from "@/components/logo";
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
  Play,
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
    { label: t("Stats.partnersLabel"), value: stats.partners, icon: Users },
    { label: t("Stats.volumeLabel"), value: stats.volume, icon: BarChart3 },
    { label: t("Stats.countriesLabel"), value: stats.countries, icon: Globe },
    { label: t("Stats.payoutLabel"), value: stats.payout, icon: Trophy },
  ];

  const trustItems = [
    { icon: Users, title: "شراكات استراتيجية", desc: "علاقات قوية وطويلة الأمد." },
    { icon: TrendingUp, title: "تركيز على النمو", desc: "تحويل الفرص إلى نتائج ملموسة." },
    { icon: ShieldCheck, title: "موثوق وآمن", desc: "التزام كامل بالنزاهة والشفافية." },
    { icon: Globe, title: "رؤية عالمية", desc: "نربط الأفكار والأسواق حول العالم." },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />

      {/* Live ticker tape */}
      <MarketTicker />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint [background-size:44px_44px] opacity-40" />
        <Container className="relative py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Copy */}
            <div className="text-center lg:text-start">
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                <span className="hidden h-px w-8 bg-brand-400/60 sm:inline-block" />
                {t("Hero.badge")}
              </span>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] text-white sm:text-6xl">
                {hero.titleTop}{" "}
                <span className="text-gradient">{hero.titleAccent}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-300 lg:mx-0">
                {hero.subtitle}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Button href="/login" className="text-base">
                  {hero.cta}
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                </Button>
                <a
                  href="#tools"
                  className="group inline-flex items-center gap-3 text-sm font-semibold text-slate-200 transition hover:text-white"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300 transition group-hover:bg-brand-500/20">
                    <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
                  </span>
                  {t("Common.viewRates")}
                </a>
              </div>
            </div>

            {/* Glowing brand emblem */}
            <div className="relative hidden lg:block" aria-hidden>
              <div className="relative mx-auto grid aspect-square max-w-md place-items-center">
                <div className="absolute inset-0 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-20 rounded-full border border-white/5" />
                <div className="hero-glow absolute inset-12 rounded-full opacity-80" />
                <LogoMark className="relative h-48 w-48 drop-shadow-[0_12px_40px_rgba(34,211,238,0.35)]" />
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="card-surface mt-16 grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
            {trustItems.map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-3.5 ${
                  i > 0 ? "sm:border-t sm:border-white/5 sm:pt-6 lg:border-t-0 lg:border-s lg:ps-6 lg:pt-0" : ""
                } ${i === 1 ? "sm:border-t-0 sm:pt-0" : ""}`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Impact stats */}
      <section className="pb-4 pt-16">
        <Container>
          <div className="mb-8 flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">أثرنا بالأرقام</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="card-surface group p-6 text-center transition hover:ring-1 hover:ring-brand-500/30"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
                  <s.icon className="h-5 w-5" />
                </span>
                <div dir="ltr" className="mt-4 text-3xl font-extrabold text-gradient">
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
                className="card-surface group p-6 transition hover:ring-1 hover:ring-brand-500/30"
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

      {/* Interactive tools (calculator / comparison / backtest) in tabs */}
      <ToolsTabs />

      {/* Live market chart (TradingView Lightweight Charts) */}
      <Reveal>
        <Markets />
      </Reveal>

      {/* Top brokers directory carousel */}
      <Reveal>
        <BrokerHighlight />
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
