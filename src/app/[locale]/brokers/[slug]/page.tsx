import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/brokers/stars";
import { BrokerReviews } from "@/components/brokers/broker-reviews";
import { statusLabel, type Broker, type BrokerReview } from "@/lib/brokers";
import { BadgeCheck, Gift, Sparkles, ExternalLink, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getBroker(slug: string): Promise<Broker | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,broker_links(id,label,referral_url,agent_commission,client_benefits)"
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

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const broker = await getBroker(slug);
  if (!broker) return { title: "شركة غير موجودة | FX Partners" };
  return {
    title: `${broker.name} — مراجعة وتقييم | FX Partners`,
    description:
      broker.description?.slice(0, 155) ??
      `مراجعة شركة ${broker.name}: التقييمات، البونصات، وروابط الإحالة.`,
  };
}

export default async function BrokerDetailPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const broker = await getBroker(slug);
  if (!broker) notFound();

  const reviews = await getReviews(broker.id);
  const links = broker.broker_links ?? [];
  const partnered = broker.status === "partnered";

  return (
    <>
      <SiteHeader />

      {/* Header */}
      <section className="hero-glow">
        <Container className="py-14">
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
            </div>
          </div>

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
                      href={l.referral_url}
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

      {/* Reviews */}
      <section className="pb-24 pt-6">
        <Container>
          <BrokerReviews
            brokerId={broker.id}
            brokerSlug={broker.slug}
            initial={reviews}
          />
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
