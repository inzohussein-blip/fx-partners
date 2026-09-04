import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Stars } from "@/components/brokers/stars";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { BrokerSubscribe } from "@/components/brokers/broker-subscribe";
import { BrokerReviews } from "@/components/brokers/broker-reviews";
import { BrokerBoard, type BoardPost } from "@/components/brokers/broker-board";
import {
  statusLabel,
  linkHref,
  regulatorMeta,
  type Broker,
  type BrokerReview,
} from "@/lib/brokers";
import { BadgeCheck, Gift, Sparkles, ExternalLink, Building2, Gauge, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

async function getBroker(slug: string): Promise<Broker | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable,supports_gold,licenses,broker_links(id,label,referral_url,agent_commission,client_benefits,code)"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as unknown as Broker) ?? null;
  } catch {
    return null;
  }
}

async function getReviews(brokerId: string): Promise<BrokerReview[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("broker_reviews")
      .select("id,user_name,comment,stars,is_admin_reply,created_at")
      .eq("broker_id", brokerId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    return (data as BrokerReview[]) ?? [];
  } catch {
    return [];
  }
}

async function getBoardPosts(brokerId: string): Promise<BoardPost[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("broker_posts")
      .select("id,parent_id,author_name,body,is_staff,likes,dislikes,created_at")
      .eq("broker_id", brokerId)
      .order("created_at", { ascending: true });
    return (data as BoardPost[]) ?? [];
  } catch {
    return [];
  }
}

async function getIsAdmin(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const broker = await getBroker(slug);
  if (!broker) return { title: "شركة غير موجودة | FX Partners" };

  const title = `${broker.name} — مراجعة وتقييم | FX Partners`;
  const description =
    broker.description?.slice(0, 155) ??
    `مراجعة شركة ${broker.name}: التقييمات، البونصات، وروابط الإحالة.`;

  const ogUrl =
    `${getSiteUrl()}/api/og/broker?name=${encodeURIComponent(broker.name)}` +
    `&rating=${broker.rating.toFixed(1)}&reviews=${broker.reviews_count}` +
    `&bonus=${encodeURIComponent(broker.deposit_bonus || broker.welcome_bonus || "")}` +
    `&partnered=${broker.status === "partnered" ? "1" : "0"}`;

  return {
    title,
    description,
    alternates: { canonical: `${getSiteUrl()}/brokers/${broker.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${getSiteUrl()}/brokers/${broker.slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: broker.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function BrokerDetailPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const broker = await getBroker(slug);
  if (!broker) notFound();

  const [reviews, boardPosts, isAdmin] = await Promise.all([
    getReviews(broker.id),
    getBoardPosts(broker.id),
    getIsAdmin(),
  ]);
  const links = broker.broker_links ?? [];
  const partnered = broker.status === "partnered";
  const primaryHref = links[0] ? linkHref(links[0]) : null;

  const highlights = [
    broker.spread_from != null && {
      icon: Activity,
      label: "السبريد من",
      value: `${broker.spread_from} نقطة`,
    },
    broker.leverage_max && {
      icon: Gauge,
      label: "الرافعة القصوى",
      value: broker.leverage_max,
    },
    (broker.licenses?.length ?? 0) > 0 && {
      icon: BadgeCheck,
      label: "التراخيص",
      value: `${broker.licenses!.length} جهة رقابية`,
    },
    (broker.deposit_bonus || broker.welcome_bonus) && {
      icon: Gift,
      label: "البونص",
      value: broker.deposit_bonus || broker.welcome_bonus || "",
    },
  ].filter(Boolean) as { icon: typeof Activity; label: string; value: string }[];

  // Structured data (schema.org) so Google can show the star rating.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: broker.name,
    description:
      broker.description ?? `مراجعة وتقييم شركة ${broker.name} على FX Partners.`,
    brand: { "@type": "Brand", name: broker.name },
    url: `${getSiteUrl()}/brokers/${broker.slug}`,
  };
  if (broker.reviews_count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: broker.rating.toFixed(1),
      reviewCount: broker.reviews_count,
      bestRating: 5,
      worstRating: 1,
    };
    jsonLd.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.stars,
        bestRating: 5,
        worstRating: 1,
      },
      author: { "@type": "Person", name: r.user_name || "عميل" },
      reviewBody: r.comment,
      datePublished: r.created_at,
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      {/* Header */}
      <section className="hero-glow">
        <Container className="py-14">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: "قارن الشركات", href: "/compare" },
                { label: broker.name },
              ]}
            />
          </div>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {broker.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={broker.logo_url}
                alt={broker.name}
                className="h-20 w-20 rounded-2xl bg-white/5 object-contain p-2"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/5 text-brand-300">
                <Building2 className="h-9 w-9" />
              </span>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">{broker.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    partnered
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {partnered && <BadgeCheck className="h-3.5 w-3.5" />}
                  {statusLabel(broker.status)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={broker.rating} size={18} />
                <span className="text-sm text-slate-400" dir="ltr">
                  {broker.rating.toFixed(1)} · {broker.reviews_count} مراجعة
                </span>
              </div>
              {broker.badges && broker.badges.length > 0 && (
                <div className="mt-3">
                  <BrokerBadges badges={broker.badges} size="md" />
                </div>
              )}

              {primaryHref && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={primaryHref}
                    target="_blank"
                    rel="nofollow noopener noreferrer sponsored"
                    className="btn-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:opacity-90"
                  >
                    افتح حساباً الآن
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5"
                  >
                    آراء العملاء
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Why this broker — highlights */}
          {highlights.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((h, i) => (
                <div key={i} className="card-surface flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300">
                    <h.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">{h.label}</div>
                    <div className="truncate font-semibold text-white" dir="auto">
                      {h.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bonuses */}
          {(broker.deposit_bonus || broker.welcome_bonus) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {broker.deposit_bonus && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
                  <Gift className="h-4 w-4" /> بونص إيداع: {broker.deposit_bonus}
                </span>
              )}
              {broker.welcome_bonus && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-2 text-sm text-brand-200">
                  <Sparkles className="h-4 w-4" /> بونص ترحيبي: {broker.welcome_bonus}
                </span>
              )}
            </div>
          )}

          {/* Specs strip: spread / leverage */}
          {(broker.spread_from != null || broker.leverage_max) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {broker.spread_from != null && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">
                  <Activity className="h-4 w-4 text-brand-300" /> السبريد من{" "}
                  <span dir="ltr" className="font-semibold">{broker.spread_from} نقطة</span>
                </span>
              )}
              {broker.leverage_max && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-200">
                  <Gauge className="h-4 w-4 text-brand-300" /> رافعة حتى{" "}
                  <span dir="ltr" className="font-semibold">{broker.leverage_max}</span>
                </span>
              )}
            </div>
          )}

          {/* Regulatory licenses */}
          {broker.licenses && broker.licenses.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 text-xs text-slate-500">التراخيص والرقابة المالية</div>
              <div className="flex flex-wrap gap-2">
                {broker.licenses.map((k) => {
                  const r = regulatorMeta(k);
                  if (!r) return null;
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300 ring-1 ring-emerald-500/20"
                    >
                      <BadgeCheck className="h-4 w-4" /> {r.flag} {r.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Description */}
      {broker.description && (
        <section className="py-10">
          <Container>
            <div className="card-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">عن الشركة</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300" dir="auto">
                {broker.description}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Referral links */}
      {links.length > 0 && (
        <section className="pb-10">
          <Container>
            <h2 className="text-xl font-bold text-white">روابط الفتح والمميزات</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {links.map((l) => (
                <div key={l.id} className="card-surface flex flex-col p-6">
                  {l.label && (
                    <span className="text-sm font-semibold text-white">{l.label}</span>
                  )}
                  <div className="mt-3 space-y-2 text-sm">
                    {l.client_benefits && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <span className="mt-0.5 text-brand-300">•</span>
                        <span>مميزات العميل: {l.client_benefits}</span>
                      </div>
                    )}
                    {l.agent_commission && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <span className="mt-0.5 text-emerald-300">•</span>
                        <span>عمولة الوكيل: {l.agent_commission}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <a
                      href={linkHref(l)}
                      target="_blank"
                      rel="nofollow noopener noreferrer sponsored"
                      className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                    >
                      فتح حساب
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Bonus/terms alerts */}
      <section className="pb-4 pt-6">
        <Container>
          <BrokerSubscribe brokerId={broker.id} brokerName={broker.name} />
        </Container>
      </section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-20 pt-6">
        <Container>
          <BrokerReviews
            brokerId={broker.id}
            brokerSlug={broker.slug}
            initial={reviews}
          />
        </Container>
      </section>

      {/* Discussion board */}
      <section className="pb-24 pt-14">
        <Container>
          <BrokerBoard
            brokerId={broker.id}
            brokerSlug={broker.slug}
            isAdmin={isAdmin}
            initial={boardPosts}
          />
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
