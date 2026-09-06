import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { getContent } from "@/lib/content";
import { EditableText } from "@/components/admin-edit/editable-text";
import { HeroTicker } from "@/components/marketing/hero-ticker";
import { ArrowLeft, MessagesSquare, Percent } from "lucide-react";

/**
 * Homepage hero — the settled "Partners FX" design.
 *
 * Layout (per the approved mockup): the platform visual sits on the RIGHT and
 * the copy on the LEFT — in both directions. RTL gets that from the natural
 * source order (first column renders right); LTR flips it back with `ltr:order-*`.
 * Copy stays start-aligned, so Arabic reads right-aligned as it should.
 */
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

  return (
    <section className="pro-hero relative">
      <span className="aurora aurora-1" aria-hidden />
      <span className="aurora aurora-2" aria-hidden />

      <Container className="relative pb-12 pt-16 sm:pb-16 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
          {/* ---------- Visual asset (right in RTL) ---------- */}
          <div className="relative order-first lg:order-1 lg:-ms-6 ltr:lg:order-2 xl:-ms-12">
            {/* Blue halo behind the globe / devices */}
            <div
              className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/25 blur-[90px]"
              aria-hidden
            />
            <div className="animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-platform.webp"
                alt="منصة FX Partners: شبكات الكرة الأرضية الرقمية مع منصة التداول على الحاسوب والجوال"
                width={1200}
                height={675}
                fetchPriority="high"
                className="hero-visual relative w-full"
              />
            </div>
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

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.22] tracking-tight text-white sm:text-5xl xl:text-6xl">
              <EditableText contentKey="home.hero" field="titleTop" label="العنوان الرئيسي">
                {hero.titleTop}
              </EditableText>{" "}
              <span className="text-gradient">
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

            {/* Three CTAs: glowing primary, hairline outline, dark glass */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <Link
                href="/login"
                className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
              >
                {hero.cta}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>

              <Link
                href="/affiliates"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-white/5"
              >
                <Percent className="h-4 w-4 text-brand-300" />
                {t("Hero.browseRates")}
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
