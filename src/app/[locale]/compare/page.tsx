import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EditableText } from "@/components/admin-edit/editable-text";
import { createClient } from "@/lib/supabase/server";
import { getContent } from "@/lib/content";
import { BrokerDirectory } from "@/components/brokers/broker-directory";
import { HeadToHeadPicker } from "@/components/brokers/head-to-head-picker";
import { SpecsGrid } from "@/components/brokers/specs-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Scale, ListChecks } from "lucide-react";
import { isRated, type Broker } from "@/lib/brokers";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    title: "مقارنة شركات التداول المرخّصة — التراخيص والسبريد والشروط",
    description:
      "قارن شركات التداول (الفوركس) في مكان واحد: الجهة الرقابية ورقم الترخيص لكل كيان، السبريد، الحد الأدنى للإيداع، الحسابات الإسلامية بدون فوائد، والعروض — بالعربية ومن مصادر قابلة للتحقّق.",
    path: "/compare",
    keywords: KEYWORDS.compare,
    locale,
  });
}

async function getBrokers(): Promise<Broker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable,supports_gold,licenses,supports_ea,allows_hedging,swap_free,allows_scalping,min_deposit,deposit_methods,broker_links(id,label,referral_url,agent_commission,client_benefits)"
      )
      .eq("is_published", true)
      .order("sort_order")
      .order("rating", { ascending: false });
    return (data as unknown as Broker[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ComparePage() {
  const brokers = await getBrokers();
  const copy = await getContent("page.compare", {
    title: "قارن شركات التداول واختر الأفضل",
    subtitle:
      "تقييمات حقيقية، بونصات محدّثة، وعمولات وكلاء شفّافة — كل ما تحتاجه لاختيار شركتك في مكان واحد.",
  });

  // ItemList structured data: tells a search engine (and an agent) that this
  // page *is* the broker directory and what is on it, in order — which is what
  // turns "أفضل شركات التداول" into a list result rather than a blue link.
  const base = getSiteUrl();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "دليل شركات التداول على FX Partners",
    numberOfItems: brokers.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: brokers.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `${base}/brokers/${b.slug}`,
      ...(isRated(b)
        ? {
            item: {
              "@type": "Product",
              name: b.name,
              url: `${base}/brokers/${b.slug}`,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: b.rating.toFixed(1),
                reviewCount: b.reviews_count,
                bestRating: 5,
                worstRating: 1,
              },
            },
          }
        : {}),
    })),
  };

  return (
    <>
      <SiteHeader />
      {brokers.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <section className="hero-glow">
        <Container className="py-9 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            دليل الشركات
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.3] text-white sm:text-4xl sm:leading-tight lg:text-5xl">
            <EditableText contentKey="page.compare" field="title" label="عنوان صفحة المقارنة">
              {copy.title}
            </EditableText>
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">
            <EditableText contentKey="page.compare" field="subtitle" label="وصف صفحة المقارنة" multiline>
              {copy.subtitle}
            </EditableText>
          </p>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          {brokers.length === 0 ? (
            <div className="card-surface p-12 text-center text-sm text-slate-500">
              لا توجد شركات مضافة بعد. أضِفها من لوحة الإدارة →{" "}
              <span className="text-brand-300">الشركات</span>.
            </div>
          ) : (
            /* On a phone the head-to-head picker filled the entire second
               screen before a single broker appeared. Someone who opens the
               directory wants the directory; picking two names to compare is
               the follow-up, so it moves below the list on small screens and
               keeps its place above on desktop, where both fit at once. */
            <div className="flex flex-col gap-6">
              {brokers.length >= 2 && (
                <div className="order-2 lg:order-1">
                  <HeadToHeadPicker
                    options={brokers.map((b) => ({ slug: b.slug, name: b.name }))}
                  />
                </div>
              )}
              <div className="order-1 lg:order-2">
                <BrokerDirectory brokers={brokers} />
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Quick operational-specs comparison grid */}
      {brokers.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading
              eyebrow="الخصائص"
              icon={ListChecks}
              title="مقارنة سريعة للخصائص التشغيلية"
              subtitle="التداول الآلي، التحوّط، الحسابات الإسلامية، طرق الإيداع والمزيد — قارن ما يهمّك فعلاً."
              align="start"
            />
            <div className="mt-10">
              <SpecsGrid brokers={brokers} />
            </div>
          </Container>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
