import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { jsonLdScript } from "@/lib/jsonld";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { BrokerRating } from "@/components/brokers/broker-rating";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { BrokerSubscribe } from "@/components/brokers/broker-subscribe";
import { BrokerReviews } from "@/components/brokers/broker-reviews";
import { BrokerBoard, type BoardPost } from "@/components/brokers/broker-board";
import { BrokerTabs } from "@/components/brokers/broker-tabs";
import { RatingBreakdown } from "@/components/brokers/rating-breakdown";
import {
  statusLabel,
  linkHref,
  regulatorMeta,
  isRated,
  externalFacts,
  type Broker,
  type BrokerReview,
} from "@/lib/brokers";
import { getAllPairs } from "@/lib/broker-pairs";
import { getPublishedPostSlugs } from "@/lib/posts";
import { BadgeCheck, Gift, Sparkles, ExternalLink, Building2, Gauge, Activity, Scale, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

async function getBroker(slug: string): Promise<Broker | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable,supports_gold,licenses,external_score,external_source,external_data,legal_entity,licence_numbers,verification_url,official_website,verification_status,verified_at,broker_links(id,label,referral_url,agent_commission,client_benefits,code)"
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

/**
 * Blog review article per broker, when one exists — for cross-linking the
 * profile to its long-form review. Slugs match supabase/seed_blog_reviews.sql.
 */
const REVIEW_ARTICLE: Record<string, string> = {
  oneroyal: "murajaat-one-royal",
  vantage: "murajaat-vantage-markets",
  xm: "murajaat-xm",
  inzo: "murajaat-inzo",
  tnfx: "murajaat-tnfx",
};

/** Arabic country label per regulator, for FAQ prose. */
const REG_COUNTRY: Record<string, string> = {
  fca: "بريطانيا",
  cysec: "قبرص",
  asic: "أستراليا",
  fsca: "جنوب أفريقيا",
  dfsa: "دبي",
  fsa: "سيشل (ترخيص خارجي)",
  fscm: "موريشيوس",
  cbcs: "كوراساو",
};

/**
 * FAQ built only from data we actually hold: the regulators are always
 * present, and each commercial fact appears only once an admin has filled it —
 * so nothing is asserted that isn't in the row. Feeds both the visible section
 * and the FAQPage structured data.
 */
function buildFaq(broker: Broker): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = [];
  const regs = (broker.licenses ?? [])
    .map((k) => {
      const m = regulatorMeta(k);
      if (!m) return null;
      const c = REG_COUNTRY[k];
      return c ? `${m.label} (${c})` : m.label;
    })
    .filter(Boolean) as string[];

  if (regs.length > 0) {
    faq.push({
      q: `هل ${broker.name} مرخّصة؟ وما الجهات الرقابية؟`,
      a: `تعمل ${broker.name} عبر كيانات مرخّصة من: ${regs.join("، ")}. والأهمّ: الترخيص الذي يحميك هو ترخيص الكيان الذي يُفتح حسابك لديه تحديدًا — تحقّق من اسم كيانك ورقم ترخيصه على سجلّ الجهة الرقابية قبل الإيداع.`,
    });
  }
  if (broker.spread_from != null) {
    faq.push({
      q: `كم يبدأ السبريد في ${broker.name}؟`,
      a: `السبريد المعلن يبدأ من ${broker.spread_from} نقطة، ويختلف بحسب الحساب والأداة وظروف السوق. تحقّق من القيمة المحدّثة على الموقع الرسمي.`,
    });
  }
  if (broker.leverage_max) {
    faq.push({
      q: `ما أقصى رافعة مالية في ${broker.name}؟`,
      a: `أقصى رافعة معلنة هي ${broker.leverage_max}، وتختلف بحسب الكيان التنظيمي والأداة. تذكّر أنّ الرافعة العالية تضخّم الخسارة كما تضخّم الربح.`,
    });
  }
  if (broker.deposit_bonus || broker.welcome_bonus) {
    faq.push({
      q: `هل يقدّم ${broker.name} بونص؟`,
      a: `العرض المعلن حاليًا: ${broker.deposit_bonus || broker.welcome_bonus}. تخضع البونصات لشروط وقد تتغيّر أو تتوقّف — اقرأ شروطها الكاملة على الموقع الرسمي قبل الاعتماد عليها.`,
    });
  }
  faq.push({
    q: `كيف أفتح حساباً لدى ${broker.name}؟`,
    a: `عبر رابط الفتح في هذه الصفحة أو من الموقع الرسمي للشركة، بعد التحقّق من الكيان الذي سيخدمك وشروط الحساب وطرق السحب ومدّته.`,
  });
  return faq;
}

/** "A؛ B; C" -> ["A", "B", "C"] — for the multi-entity verification fields. */
function splitList(v: string): string[] {
  return v.split(/\s*[؛;]\s*/).map((x) => x.trim()).filter(Boolean);
}

export async function generateMetadata({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const broker = await getBroker(slug);
  if (!broker) return { title: "شركة غير موجودة" };

  const title = `${broker.name} — مراجعة وتقييم وتراخيص`;
  const description =
    broker.description?.slice(0, 155) ??
    `مراجعة شركة ${broker.name}: التقييمات، البونصات، وروابط الإحالة.`;

  const ogUrl =
    `${getSiteUrl()}/api/og/broker?name=${encodeURIComponent(broker.name)}` +
    `&rating=${isRated(broker) ? broker.rating.toFixed(1) : ""}` +
    `&reviews=${isRated(broker) ? broker.reviews_count : ""}` +
    `&bonus=${encodeURIComponent(broker.deposit_bonus || broker.welcome_bonus || "")}` +
    `&partnered=${broker.status === "partnered" ? "1" : "0"}`;

  return pageMeta({
    title,
    description,
    path: `/brokers/${broker.slug}`,
    locale,
    type: "article",
    image: ogUrl,
    keywords: [
      `${broker.name} مراجعة`,
      `${broker.name} ترخيص`,
      `هل ${broker.name} مرخصة`,
      "شركات تداول مرخصة",
    ],
  });
}

export default async function BrokerDetailPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const broker = await getBroker(slug);
  if (!broker) notFound();

  const [reviews, boardPosts, isAdmin, allPairs, publishedPosts] = await Promise.all([
    getReviews(broker.id),
    getBoardPosts(broker.id),
    getIsAdmin(),
    getAllPairs(),
    getPublishedPostSlugs(),
  ]);
  // Head-to-head pages this broker appears in — the highest-intent surface on
  // the site, otherwise only reachable from the comparison pages themselves.
  const comparisons = allPairs
    .filter((p) => p.a === broker.slug || p.b === broker.slug)
    .slice(0, 12)
    .map((p) => ({
      slug: p.slug,
      otherName: p.a === broker.slug ? p.bName : p.aName,
    }));
  const links = broker.broker_links ?? [];
  const partnered = broker.status === "partnered";
  const primaryHref = links[0] ? linkHref(links[0]) : null;
  const faq = buildFaq(broker);
  const reviewCandidate = REVIEW_ARTICLE[broker.slug];
  // Only link to the review once its post is actually published, or the link 404s.
  const reviewSlug = reviewCandidate && publishedPosts.has(reviewCandidate) ? reviewCandidate : undefined;

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
    broker.deposit_bonus && {
      icon: Gift,
      label: "بونص الإيداع",
      value: broker.deposit_bonus,
    },
    broker.welcome_bonus && {
      icon: Sparkles,
      label: "البونص الترحيبي",
      value: broker.welcome_bonus,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "قارن الشركات",
        item: `${getSiteUrl()}/compare`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: broker.name,
        item: `${getSiteUrl()}/brokers/${broker.slug}`,
      },
    ],
  };

  const faqJsonLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
        />
      )}
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
          {/* Two tracks on desktop: identity and highlights, and a side card
              with the verified facts and the next step. On its own the
              identity block filled half the width, and a broker without a
              referral link — every broker today — offered no action at all. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {broker.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async"
                src={broker.logo_url}
                alt={broker.name}
                className="h-20 w-20 rounded-2xl bg-fg/5 object-contain p-2"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-fg/5 text-brand-300">
                <Building2 className="h-9 w-9" />
              </span>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-fg">{broker.name}</h1>
                {partnered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {statusLabel(broker.status)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {isRated(broker) || broker.external_score != null ? (
                  <BrokerRating broker={broker} size={18} />
                ) : (
                  <span className="text-sm text-slate-400">
                    لا توجد مراجعات بعد — كن أول من يقيّم هذه الشركة
                  </span>
                )}
              </div>
              {broker.external_source && broker.verification_status !== "verified" && (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  بيانات هذه الشركة من مصدر خارجي ولم تتحقّق منها المنصّة بعد — تحقّق من ترخيص الكيان قبل الإيداع.
                </p>
              )}
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
                    className="inline-flex items-center gap-2 rounded-xl border border-fg/10 px-6 py-3 text-base font-medium text-slate-200 transition hover:bg-fg/5"
                  >
                    آراء العملاء
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Why this broker — highlights */}
          {highlights.length > 0 && (
            /* The four facts a visitor came here for. One per row with desktop
               padding they cost ~700px of scrolling on a phone before the
               review even starts; two-up they are one glance. */
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="card-surface flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 sm:h-10 sm:w-10">
                    <h.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[10px] text-slate-500 sm:text-xs">{h.label}</div>
                    <div
                      className="truncate text-[13px] font-semibold text-fg sm:text-base"
                      dir="auto"
                    >
                      {h.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          </div>

          <aside className="card-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-fg">التراخيص الموثّقة</h2>
            {(broker.licenses ?? []).some((k) => regulatorMeta(k)) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(broker.licenses ?? []).map((k) => {
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
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                لم نتحقّق بعد من تراخيص هذه الشركة في سجلات الجهات الرقابية.
              </p>
            )}
            {/* Filled from the manual verification sheet (migration 0033). */}
            {(broker.legal_entity || broker.licence_numbers) && (
              <dl className="mt-4 space-y-3 text-sm">
                {broker.legal_entity && (
                  <div>
                    <dt className="text-xs text-slate-500">الكيان القانوني</dt>
                    {/* One entity per line: joined by «؛» inside Latin text
                        the separator read as a colon. */}
                    {splitList(broker.legal_entity).map((part) => (
                      <dd key={part} className="mt-0.5 leading-relaxed text-slate-200">
                        <bdi>{part}</bdi>
                      </dd>
                    ))}
                  </div>
                )}
                {broker.licence_numbers && (
                  <div>
                    <dt className="text-xs text-slate-500">أرقام التراخيص</dt>
                    {/* One entity per line: joined by «؛» inside Latin text
                        the separator read as a colon. */}
                    {splitList(broker.licence_numbers).map((part) => (
                      <dd key={part} className="mt-0.5 leading-relaxed text-slate-200">
                        <bdi>{part}</bdi>
                      </dd>
                    ))}
                  </div>
                )}
              </dl>
            )}
            {broker.verification_status === "verified" && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                تحقّقنا من الكيان والترخيص
                {broker.verified_at && <span dir="ltr">{broker.verified_at}</span>}
              </p>
            )}
            {broker.verification_url && (
              <a
                href={broker.verification_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-3 flex min-h-6 items-center gap-1.5 text-sm text-brand-300 hover:underline"
              >
                السجل لدى الجهة الرقابية
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              الترخيص الذي يحميك هو ترخيص الكيان الذي يُفتح حسابك لديه — تحقّق منه قبل الإيداع.
            </p>

            {(broker.official_website || broker.external_data?.website_url) && (
              <a
                href={(broker.official_website || broker.external_data?.website_url)!}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-4 inline-flex min-h-6 items-center gap-1.5 text-sm text-brand-300 hover:underline"
              >
                الموقع الرسمي
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}

            <div className="mt-5 grid gap-2.5 border-t border-fg/[0.06] pt-5">
              <a
                href="#reviews"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-fg/[0.06] px-4 text-sm font-semibold text-fg ring-1 ring-fg/10 transition hover:bg-fg/10"
              >
                أضف مراجعتك
              </a>
              <Link
                href="/compare"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-fg/10 px-4 text-sm font-medium text-slate-200 transition hover:bg-fg/5"
              >
                قارن مع شركة أخرى
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
              </Link>
            </div>
          </aside>
          </div>
        </Container>
      </section>

      {/* Sticky in-page tabs */}
      <BrokerTabs
        tabs={[
          { id: "overview", label: "نظرة عامة" },
          { id: "ratings", label: "التقييم" },
          // The section only renders when the broker has links; a tab to a
          // missing anchor did nothing when tapped.
          ...(links.length > 0 ? [{ id: "accounts", label: "روابط الحسابات" }] : []),
          ...(faq.length > 0 ? [{ id: "faq", label: "أسئلة شائعة" }] : []),
          { id: "reviews", label: "آراء العملاء" },
          { id: "community", label: "النقاش" },
        ]}
      />


      {/* Description */}
      {broker.description && (
        <section id="overview" className="scroll-mt-24 py-10">
          <Container>
            <div className="card-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-fg">عن الشركة</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300" dir="auto">
                {broker.description}
              </p>
              {reviewSlug && (
                <div className="mt-4 border-t border-fg/10 pt-4">
                  <Link
                    href={`/blog/${reviewSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:underline"
                  >
                    اقرأ مراجعتنا الكاملة لـ {broker.name}
                    <span aria-hidden>←</span>
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* External directory data — shown attributed and apart from our
          verified specs, so it is never mistaken for a checked fact. */}
      {externalFacts(broker).length > 0 && (
        <section className="pb-10">
          <Container>
            <div className="card-surface p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-fg">معلومات من مصدر خارجي</h2>
              <p className="mt-1 text-xs text-slate-500">
                لم تتحقّق منها المنصّة بعد. راجع الموقع الرسمي وسجلّ الجهة الرقابية قبل الاعتماد عليها.
              </p>
              {/* Tiles, with long values (licence details, HQ) across the
                  row. The value is a <bdi>, not dir="auto" on the <dd>: that
                  flipped the whole cell LTR, so a Latin value like "5$" or
                  "ECN" sat at the far side, away from its own label. */}
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {externalFacts(broker).map((f) => (
                  <div
                    key={f.label}
                    className={cn(
                      "rounded-xl bg-fg/[0.03] p-3.5 ring-1 ring-fg/[0.06]",
                      f.value.length > 60 && "sm:col-span-2 lg:col-span-3"
                    )}
                  >
                    <dt className="text-xs text-slate-500">{f.label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-slate-200">
                      <bdi>{f.value}</bdi>
                    </dd>
                  </div>
                ))}
              </dl>
              {broker.external_data?.website_url && (
                <a
                  href={broker.external_data.website_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand-300 hover:underline"
                >
                  الموقع الرسمي
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Rating breakdown */}
      <section id="ratings" className="scroll-mt-24 pb-10 pt-2">
        <Container>
          <h2 className="mb-5 text-xl font-bold text-fg">تقييم الشركة</h2>
          <RatingBreakdown broker={broker} />
        </Container>
      </section>

      {/* Referral links */}
      {links.length > 0 && (
        <section id="accounts" className="scroll-mt-24 pb-10">
          <Container>
            <h2 className="text-xl font-bold text-fg">روابط الفتح والمميزات</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {links.map((l) => (
                <div key={l.id} className="card-surface flex flex-col p-6">
                  {l.label && (
                    <span className="text-sm font-semibold text-fg">{l.label}</span>
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

      {/* Head-to-head comparisons */}
      {comparisons.length > 0 && (
        <section id="compare" className="scroll-mt-24 pb-4 pt-10">
          <Container>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-fg">
              <Scale className="h-5 w-5 text-brand-300" aria-hidden />
              قارن {broker.name} مع وسطاء آخرين
            </h2>
            <div className="flex flex-wrap gap-2">
              {comparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/vs/${c.slug}`}
                  className="rounded-xl border border-fg/10 px-3.5 py-2 text-sm text-slate-300 transition hover:border-brand-400/50 hover:text-fg"
                >
                  {broker.name} مقابل {c.otherName}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section id="faq" className="scroll-mt-24 pb-4 pt-10">
          <Container>
            <h2 className="mb-5 text-xl font-bold text-fg">
              أسئلة شائعة عن {broker.name}
            </h2>
            <div className="space-y-3">
              {faq.map((f, i) => (
                <details
                  key={i}
                  className="card-surface group p-5"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-fg">
                    <span dir="auto">{f.q}</span>
                    <span
                      aria-hidden
                      className="shrink-0 text-slate-500 transition group-open:rotate-180"
                    >
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-slate-300" dir="auto">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-24 pt-6">
        <Container>
          <BrokerReviews
            brokerId={broker.id}
            brokerSlug={broker.slug}
            initial={reviews}
          />
        </Container>
      </section>

      {/* Discussion board */}
      <section id="community" className="scroll-mt-24 pb-24 pt-14">
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
