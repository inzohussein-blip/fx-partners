import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getContent } from "@/lib/content";
import {
  Check,
  UserPlus,
  Link2,
  Wallet,
  TrendingUp,
  Zap,
  Headphones,
  Layers,
  ArrowLeft,
  Rocket,
  Award,
  Sparkles,
  Handshake,
  Network,
  Building2,
  Scale,
  Users,
  ShieldCheck,
} from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Affiliates" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/affiliates",
    keywords: KEYWORDS.affiliates,
    locale,
  });
}

/** The brand word inside the model heading, picked out in the gradient. */
function Gradient(chunks: React.ReactNode) {
  return <span className="text-gradient">{chunks}</span>;
}
/** "FX Partners" inside the model paragraph. */
function Strong(chunks: React.ReactNode) {
  return <span className="font-semibold text-fg">{chunks}</span>;
}

export default async function AffiliatesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Affiliates" });

  // Owner-editable, with the shipped defaults coming from the catalogue so an
  // untouched site reads in the visitor's language rather than in Arabic.
  const rates = await getContent("affiliates.rates", {
    revenue_share: t("defaultRevenueShare"),
    cpa: t("defaultCpa"),
    sub_ib: t("defaultSubIb"),
  });

  const tiers = [
    {
      name: "Standard",
      share: "40%",
      cpa: "$400",
      features: ["tierStandard1", "tierStandard2", "tierStandard3"],
      highlight: false,
    },
    {
      name: "Gold",
      share: "55%",
      cpa: "$800",
      features: ["tierGold1", "tierGold2", "tierGold3", "tierGold4"],
      highlight: true,
    },
    {
      name: "VIP",
      share: "60%",
      cpa: "$1,200",
      features: ["tierVip1", "tierVip2", "tierVip3", "tierVip4"],
      highlight: false,
    },
  ];

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-10 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Handshake className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-4xl sm:leading-tight lg:text-5xl">
            {t("h1")}
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            {t("lead")}
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {[
              { label: "Revenue Share", value: rates.revenue_share },
              { label: "CPA", value: rates.cpa },
              { label: "Sub-IB", value: rates.sub_ib },
            ].map((r) => (
              <div
                key={r.label}
                className="card-surface flex items-center justify-between gap-3 p-3.5 sm:block sm:p-6"
              >
                <div className="text-lg font-bold text-brand-300 sm:text-2xl">{r.value}</div>
                <div className="text-xs text-slate-400 sm:mt-1 sm:text-sm">{r.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Identity: we are a Master IB, you join as a Sub-IB across a whole network */}
      <section className="ambient-section py-16">
        <span
          className="ambient inset-x-1/4 top-0 h-64"
          style={{ background: "radial-gradient(circle, rgba(0,144,252,0.20) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container>
          <div className="card-surface relative overflow-hidden p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
                  <Network className="h-3.5 w-3.5" aria-hidden />
                  {t("modelEyebrow")}
                </span>
                <h2 className="mt-4 text-2xl font-bold text-fg sm:text-3xl">
                  {t.rich("modelTitle", { g: Gradient })}
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  {t.rich("modelBody", { b: Strong })}
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  {
                    icon: Building2,
                    title: t("model1Title"),
                    desc: t("model1Desc"),
                  },
                  {
                    icon: Scale,
                    title: t("model2Title"),
                    desc: t("model2Desc"),
                  },
                  {
                    icon: Users,
                    title: t("model3Title"),
                    desc: t("model3Desc"),
                  },
                  {
                    icon: ShieldCheck,
                    title: t("model4Title"),
                    desc: t("model4Desc"),
                  },
                ].map((f) => (
                  <li
                    key={f.title}
                    className="flex gap-3 rounded-xl bg-fg/[0.03] p-3 ring-1 ring-fg/5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-fg">{f.title}</div>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow={t("stepsEyebrow")}
            icon={Rocket}
            title={t("stepsTitle")}
            subtitle={t("stepsSubtitle")}
          />

          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: UserPlus, title: t("step1Title"), desc: t("step1Desc") },
              { icon: Link2, title: t("step2Title"), desc: t("step2Desc") },
              { icon: Wallet, title: t("step3Title"), desc: t("step3Desc") },
            ].map((s, i) => (
              <div key={s.title} className="card-surface relative p-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-fg/5 text-xs font-bold text-brand-300">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-fg">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow={t("tiersEyebrow")}
            icon={Award}
            title={t("tiersTitle")}
            subtitle={t("tiersSubtitle")}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`card-surface relative p-8 ${
                  tier.highlight ? "border-brand-500/40 shadow-glow" : ""
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                    {t("mostPopular")}
                  </span>
                )}
                <h3 className="text-xl font-bold text-fg">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-fg">{tier.share}</span>
                  <span className="text-sm text-slate-400">Revenue Share</span>
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {t("orCpaUpTo", { amount: tier.cpa })}
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                      {t(key)}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    href="/login"
                    variant={tier.highlight ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {t("startNow")}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* The tier table is a commercial offer, so it says what governs it.
              Without this the percentages read as a promise rather than as
              what they are: indicative rates settled by a signed agreement. */}
          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-slate-500">
            {t("tiersNote")}
          </p>
        </Container>
      </section>

      {/* Why partners choose us */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow={t("benefitsEyebrow")}
            icon={Sparkles}
            title={t("benefitsTitle")}
            subtitle={t("benefitsSubtitle")}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: t("benefit1Title"), desc: t("benefit1Desc") },
              { icon: Zap, title: t("benefit2Title"), desc: t("benefit2Desc") },
              { icon: Layers, title: t("benefit3Title"), desc: t("benefit3Desc") },
              { icon: Headphones, title: t("benefit4Title"), desc: t("benefit4Desc") },
            ].map((b) => (
              <div key={b.title} className="card-surface p-6">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-fg">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-12">
        <Container>
          <div className="card-surface relative overflow-hidden p-10 text-center sm:p-14">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-fg sm:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                {t("ctaBody")}
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/login" className="text-base">
                  {t("ctaButton")}
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
