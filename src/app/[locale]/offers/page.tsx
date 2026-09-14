import type { Metadata } from "next";
import { getContent, contentKeyFor } from "@/lib/content";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EditableText } from "@/components/admin-edit/editable-text";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CouponCard, type Coupon } from "@/components/marketing/coupon-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Crosshair, ArrowLeft, Flame, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "OffersPage" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/offers",
    keywords: KEYWORDS.offers,
    locale,
  });
}

type Campaign = {
  id: string;
  broker_slug: string | null;
  title: string;
  message: string;
  cta_label: string | null;
  created_at: string;
};

async function getCampaigns(): Promise<Campaign[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("id,broker_slug,title,message,cta_label,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as Campaign[]) ?? [];
  } catch {
    return [];
  }
}

async function getCoupons(): Promise<Coupon[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("id,broker_name,title,code,referral_url,description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as Coupon[]) ?? [];
  } catch {
    return [];
  }
}

export default async function OffersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "OffersPage" });
  const key = contentKeyFor("page.offers", locale);
  const copy = await getContent(key, {
    title: t("title"),
    subtitle: t("subtitle"),
  });

  const [campaigns, coupons] = await Promise.all([getCampaigns(), getCoupons()]);

  return (
    <>
      <SiteHeader />

      <section className="hero-glow">
        <Container className="py-9 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Crosshair className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-fg sm:text-4xl sm:leading-tight lg:text-5xl">
            <EditableText contentKey={key} field="title" label={t("editTitle")}>
              {copy.title}
            </EditableText>
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            <EditableText contentKey={key} field="subtitle" label={t("editSubtitle")} multiline>
              {copy.subtitle}
            </EditableText>
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow={t("activeEyebrow")}
            icon={Flame}
            title={t("activeTitle")}
            subtitle={t("activeSubtitle")}
            align="start"
          />
          <div className="mt-10" />
          {campaigns.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              {t("empty")}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <div key={c.id} className="card-surface relative overflow-hidden p-6">
                  <div className="hero-glow absolute inset-0 opacity-50" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs sm:text-[11px] text-orange-300">
                      <Flame className="h-3 w-3" /> {t("activeBadge")}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-fg">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300" dir="auto">
                      {c.message}
                    </p>
                    {c.broker_slug && (
                      <Link
                        href={`/brokers/${c.broker_slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                      >
                        {c.cta_label || t("defaultCta")}
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Exclusive coupon codes */}
      {coupons.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading
              eyebrow={t("couponsEyebrow")}
              icon={Ticket}
              title={t("couponsTitle")}
              subtitle={t("couponsSubtitle")}
              align="start"
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <CouponCard key={c.id} coupon={c} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
