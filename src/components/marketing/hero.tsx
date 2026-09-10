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
  const hasBrokers = brokers.length > 0;

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

      <Container className="relative pb-10 pt-14 sm:pb-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          {/* ---------- Copy + CTAs (right in RTL) ---------- */}
          <div className="relative text-center lg:text-start">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3.5 lg:justify-start">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-slate-400">
                {t("Hero.badge")}
              </span>
              <span
                className="h-px w-14 bg-gradient-to-l from-brand-300 to-transparent"
                aria-hidden
              />
            </div>

            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.5] tracking-tight text-white sm:text-5xl">
              <EditableText contentKey="home.hero" field="titleTop" label="العنوان الرئيسي">
                {hero.titleTop}
              </EditableText>
              <span className="mt-1 block text-gradient">
                <EditableText contentKey="home.hero" field="titleAccent" label="الكلمة المميّزة">
                  {hero.titleAccent}
                </EditableText>
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300/90 sm:text-[17px] lg:mx-0">
              <EditableText contentKey="home.hero" field="subtitle" label="وصف الهيرو" multiline>
                {hero.subtitle}
              </EditableText>
            </p>

            {/* Audience paths + community entry point */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <Link
                href="/compare"
                className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
              >
                <Users className="h-4 w-4" />
                {t("Hero.ctaTrader")}
              </Link>

              <Link
                href="/affiliates"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5"
              >
                <Share2 className="h-4 w-4 text-brand-300" />
                {t("Hero.ctaAgent")}
              </Link>

              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/[0.12] hover:text-white"
              >
                <MessagesSquare className="h-4 w-4" />
                {t("Hero.enterForum")}
              </Link>
            </div>

            {/* Four proof points */}
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2 lg:mx-0">
              {features.map((f) => (
                <div key={f.key} className="flex items-center gap-3 text-start">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-300">
                    <f.icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-white">
                      {t(`Hero.features.${f.key}.title`)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {t(`Hero.features.${f.key}.desc`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Visual stage: globe behind, comparison window in front ---------- */}
          <div className="relative mx-auto h-[430px] w-full max-w-[34rem] sm:h-[510px] lg:h-[580px]">
            {/* With data the globe sits off to the side so the card can overlap
                it; with none it centres, so the stage never looks half-empty. */}
            <HeroGlobe
              className={
                hasBrokers
                  ? "absolute end-0 -top-4 aspect-square w-[96%] max-w-[34rem]"
                  : "absolute inset-x-0 top-1/2 mx-auto aspect-square w-[86%] max-w-[30rem] -translate-y-1/2"
              }
            />

            {/* Comparison window overlaps the globe — only when there is
                something to compare, never as an empty shell. */}
            {hasBrokers && (
              <div className="absolute bottom-0 start-0 z-10 w-full max-w-[25rem]">
                <HeroLeaderboard brokers={brokers} />
              </div>
            )}

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
        </div>
      </Container>

      {/* ---------- Live ticker bar ---------- */}
      <HeroTicker viewAllLabel={t("Hero.viewAllMarkets")} />
    </section>
  );
}
