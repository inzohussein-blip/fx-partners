import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { getContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { EditableText } from "@/components/admin-edit/editable-text";
import { HeroTicker } from "@/components/marketing/hero-ticker";
import { ConnectionDiagram } from "@/components/marketing/connection-diagram";
import { MessagesSquare, Users, Share2 } from "lucide-react";

/**
 * Homepage hero — the settled "Partners FX" design.
 *
 * Layout (per the approved mockup): the platform visual sits on the RIGHT and
 * the copy on the LEFT — in both directions. RTL gets that from the natural
 * source order (first column renders right); LTR flips it back with `ltr:order-*`.
 * Copy stays start-aligned, so Arabic reads right-aligned as it should.
 */
/** Published partner brokers for the hero's network diagram (best-effort). */
async function getPartnerBrokers() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("name,logo_url")
      .eq("is_published", true)
      .order("sort_order")
      .limit(5);
    return (data as { name: string; logo_url: string | null }[] | null) ?? [];
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

  // Real partner brokers power the network node of the identity diagram.
  const brokers = await getPartnerBrokers();

  return (
    <section className="pro-hero relative">
      <span className="aurora aurora-1" aria-hidden />
      <span className="aurora aurora-2" aria-hidden />

      <Container className="relative pb-12 pt-16 sm:pb-16 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
          {/* ---------- Visual asset (right in RTL) ---------- */}
          <div className="relative order-first lg:order-1 ltr:lg:order-2">
            <ConnectionDiagram brokers={brokers} />
          </div>

          {/* ---------- Copy + CTAs (left in RTL) ---------- */}
          <div className="relative order-last text-center lg:order-2 lg:text-start ltr:lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              {t("Hero.badge")}
            </span>

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.22] tracking-tight text-white sm:text-5xl">
              <EditableText contentKey="home.hero" field="titleTop" label="العنوان الرئيسي">
                {hero.titleTop}
              </EditableText>
              <span className="mt-1 block text-gradient">
                <EditableText contentKey="home.hero" field="titleAccent" label="الكلمة المميّزة">
                  {hero.titleAccent}
                </EditableText>
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-300/90 sm:text-lg lg:mx-0">
              <EditableText contentKey="home.hero" field="subtitle" label="وصف الهيرو" multiline>
                {hero.subtitle}
              </EditableText>
            </p>

            {/* Trust line — review-platform credibility (brand brief) */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-brand-200/90 lg:justify-start">
              {t("Hero.trustLine").split("·").map((part, i) => (
                <span key={i} className="inline-flex items-center gap-3">
                  {i > 0 && <span className="text-brand-400/50">•</span>}
                  {part.trim()}
                </span>
              ))}
            </div>

            {/* Two audience paths — our visitors are two different people —
                plus the community entry point. */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <Link
                href="/compare"
                className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
              >
                <Users className="h-4 w-4" />
                {t("Hero.ctaTrader")}
              </Link>

              <Link
                href="/affiliates"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5"
              >
                <Share2 className="h-4 w-4 text-brand-300" />
                {t("Hero.ctaAgent")}
              </Link>

              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/[0.12] hover:text-white"
              >
                <MessagesSquare className="h-4 w-4" />
                {t("Hero.enterForum")}
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* ---------- Live ticker bar ---------- */}
      <HeroTicker viewAllLabel={t("Hero.viewAllMarkets")} />
    </section>
  );
}
