import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { EditableText } from "@/components/admin-edit/editable-text";
import { HeroTicker } from "@/components/marketing/hero-ticker";
import { HeroGlobe } from "@/components/marketing/hero-globe";
import { HeroLeaderboard, type LeaderRow } from "@/components/marketing/hero-leaderboard";
import {
  MessagesSquare,
  Users,
  Share2,
  ShieldCheck,
  BadgeCheck,
  Zap,
  Headphones,
} from "lucide-react";

/**
 * Homepage hero — the approved Partners FX composition.
 *
 * The copy column comes first in the DOM, so RTL renders it on the right and
 * the visual stage on the left (LTR mirrors it naturally). In the stage the
 * glowing network globe sits behind and the broker-comparison window overlaps
 * it in front, with two stat chips floating around the composition.
 */

/** Top-rated published brokers for the hero comparison window (best-effort). */
async function getPartnerBrokers(): Promise<LeaderRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("name,slug,logo_url,rating,reviews_count,status")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .limit(5);
    return (data as LeaderRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations();

  const fallback = {
    titleTop: t("Hero.titleTop"),
    titleAccent: t("Hero.titleAccent"),
    subtitle: t("Hero.subtitle"),
    cta: t("Common.startPartnership"),
  };
  // Arabic copy is CMS-editable; English comes from the message catalog.
  const hero =
    locale === "ar" ? await getContent("home.hero", fallback) : fallback;

  const brokers = await getPartnerBrokers();

  const features = [
    { icon: ShieldCheck, key: "regulated" },
    { icon: BadgeCheck, key: "verified" },
    { icon: Zap, key: "terms" },
    { icon: Headphones, key: "support" },
  ] as const;

  return (
    <section className="pro-hero relative">
      <span className="aurora aurora-1" aria-hidden />
      <span className="aurora aurora-2" aria-hidden />

      <Container className="relative pb-8 pt-8 sm:pb-14 sm:pt-20">
        {/*
          Two different compositions, one DOM tree.

          On a phone the order is what a thumb should meet: headline, one
          decision, then the product itself. The desktop arrangement — copy on
          the right, globe and comparison window on the left — is rebuilt at
          `lg` with explicit grid placement, so the approved composition is
          untouched while the phone stops being a squeezed copy of it. A single
          <h1> serves both; nothing is duplicated and hidden.
        */}
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-8 lg:gap-y-10">
          {/* ---------- A · Copy + CTAs ---------- */}
          <div className="order-1 text-center lg:order-none lg:col-start-1 lg:row-start-1 lg:text-start">
            <div className="flex items-center justify-center gap-3.5 lg:justify-start">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400 sm:text-[11px] sm:tracking-[0.28em]">
                {t("Hero.badge")}
              </span>
              <span
                className="h-px w-10 bg-gradient-to-l from-brand-300 to-transparent sm:w-14"
                aria-hidden
              />
            </div>

            {/* Phones get tight leading and a smaller size — the desktop
                4xl/1.5 turned this into three full screen-widths of text. */}
            <h1 className="mt-4 text-balance text-[28px] font-extrabold leading-[1.3] tracking-tight text-white sm:mt-5 sm:text-4xl sm:leading-[1.5] lg:text-5xl">
              <EditableText contentKey="home.hero" field="titleTop" label="العنوان الرئيسي">
                {hero.titleTop}
              </EditableText>
              <span className="mt-1 block text-gradient">
                <EditableText contentKey="home.hero" field="titleAccent" label="الكلمة المميّزة">
                  {hero.titleAccent}
                </EditableText>
              </span>
            </h1>

            <p className="mx-auto mt-3.5 max-w-xl text-pretty text-[15px] leading-relaxed text-slate-300/90 sm:mt-5 sm:text-base lg:mx-0 lg:text-[17px]">
              <EditableText contentKey="home.hero" field="subtitle" label="وصف الهيرو" multiline>
                {hero.subtitle}
              </EditableText>
            </p>

            {/* One full-width primary action on a phone; the other two share a
                row beneath it instead of stacking into three equal blocks. */}
            <div className="mt-6 sm:mt-8 lg:flex lg:flex-wrap lg:items-center lg:gap-2.5">
              <Link
                href="/compare"
                className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[15px] font-bold text-white shadow-glow transition hover:opacity-95 lg:inline-flex lg:w-auto lg:py-3.5 lg:text-sm"
              >
                <Users className="h-4 w-4" />
                {t("Hero.ctaTrader")}
              </Link>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:mt-0 lg:flex lg:gap-2.5">
                <Link
                  href="/affiliates"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3.5 text-[13px] font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5 lg:px-6 lg:text-sm"
                >
                  <Share2 className="h-4 w-4 shrink-0 text-brand-300" />
                  {t("Hero.ctaAgent")}
                </Link>

                <Link
                  href="/forum"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-[13px] font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/[0.12] hover:text-white lg:px-5 lg:text-sm"
                >
                  <MessagesSquare className="h-4 w-4 shrink-0" />
                  {t("Hero.enterForum")}
                </Link>
              </div>
            </div>
          </div>

          {/* ---------- B · Visual stage: globe behind, comparison window in front ---------- */}
          <div className="relative order-2 mx-auto w-full max-w-[34rem] sm:h-[510px] lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-[580px]">
            {/* The globe is the decoration and the card is the product. There
                is room for both on a laptop and not on a phone, so the phone
                gets the card at full width and drops the globe rather than
                stacking a 340px illustration in front of the only thing on
                this screen a visitor can act on. */}
            <HeroGlobe className="absolute end-0 -top-2 hidden aspect-square w-[86%] max-w-[34rem] sm:-top-4 sm:block sm:w-[96%]" />

            {/* From `sm` up the window overlaps the globe — that overlap is the
                composition. With no broker rows yet it shows placeholder lines
                rather than vanishing, so the hero never half-collapses. */}
            <div className="w-full sm:absolute sm:bottom-0 sm:start-0 sm:z-10 sm:max-w-[25rem]">
              <HeroLeaderboard brokers={brokers} />
            </div>

            {/* Floating stat chips — values come from the editable Stats copy */}
            <div className="absolute start-0 top-1 z-20 hidden rounded-2xl border border-brand-500/25 bg-ink-800/95 px-4 py-3 shadow-[0_24px_56px_-24px_rgba(0,0,0,1)] sm:block">
              <div className="text-lg font-extrabold text-gradient" dir="ltr">
                {t("Stats.brokersCount")}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {t("Stats.brokersLabel")}
              </div>
            </div>

            <div className="absolute end-0 top-[44%] z-20 hidden rounded-2xl border border-brand-500/25 bg-ink-800/95 px-4 py-3 shadow-[0_24px_56px_-24px_rgba(0,0,0,1)] sm:block">
              <div className="text-lg font-extrabold text-gradient" dir="ltr">
                {t("Stats.agents")}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {t("Stats.agentsLabel")}
              </div>
            </div>
          </div>

          {/* ---------- C · Proof points ---------- */}
          {/* Four tall rows pushed everything below them off a phone screen;
              as a 2×2 chip grid they read at a glance and cost 120px. */}
          <div className="order-3 grid grid-cols-2 gap-2.5 lg:order-none lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:grid-cols-2 lg:gap-4">
            {features.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-start lg:border-0 lg:bg-transparent lg:p-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-300 lg:h-10 lg:w-10 lg:rounded-xl">
                  <f.icon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold leading-tight text-white lg:text-[13px]">
                    {t(`Hero.features.${f.key}.title`)}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-slate-400 lg:text-[11px]">
                    {t(`Hero.features.${f.key}.desc`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ---------- Live ticker bar ---------- */}
      <HeroTicker viewAllLabel={t("Hero.viewAllMarkets")} />
    </section>
  );
}
