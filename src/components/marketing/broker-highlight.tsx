import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/brokers/stars";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { statusLabel, type Broker } from "@/lib/brokers";
import { BadgeCheck, Gift, ArrowLeft, Building2, Scale } from "lucide-react";

async function getTopBrokers(): Promise<Broker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(
        "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges"
      )
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .order("reviews_count", { ascending: false })
      .limit(9);
    return (data as unknown as Broker[]) ?? [];
  } catch {
    return [];
  }
}

export async function BrokerHighlight() {
  const brokers = await getTopBrokers();
  if (brokers.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <Scale className="h-3.5 w-3.5" />
              دليل الشركات
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              أفضل شركات التداول
            </h2>
            <p className="mt-3 max-w-xl text-slate-400">
              تقييمات حقيقية وبونصات محدّثة — قارن واختر شركتك بثقة.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            قارن كل الشركات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <Carousel
            autoPlayMs={brokers.length > 3 ? 5000 : undefined}
            items={brokers.map((b) => {
            const partnered = b.status === "partnered";
            return (
              <Link
                key={b.id}
                href={`/brokers/${b.slug}`}
                className="card-surface group block h-full p-6 transition hover:ring-1 hover:ring-brand-500/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {b.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" decoding="async"
                        src={b.logo_url}
                        alt={b.name}
                        className="h-11 w-11 rounded-xl bg-white/5 object-contain p-1"
                      />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-brand-300">
                        <Building2 className="h-5 w-5" />
                      </span>
                    )}
                    <span className="font-semibold text-white">{b.name}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      partnered
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {partnered && <BadgeCheck className="h-3 w-3" />}
                    {statusLabel(b.status)}
                  </span>
                </div>

                {b.badges && b.badges.length > 0 && (
                  <div className="mt-3">
                    <BrokerBadges badges={b.badges} />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Stars value={b.rating} />
                  <span className="text-xs text-slate-500" dir="ltr">
                    {b.rating.toFixed(1)} ({b.reviews_count})
                  </span>
                </div>

                {(b.deposit_bonus || b.welcome_bonus) && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {b.deposit_bonus && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">
                        <Gift className="h-3 w-3" /> إيداع {b.deposit_bonus}
                      </span>
                    )}
                    {b.welcome_bonus && (
                      <span className="rounded-full bg-brand-500/10 px-2 py-1 text-brand-200">
                        ترحيبي {b.welcome_bonus}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-5 inline-flex items-center gap-1 text-sm text-brand-300 transition group-hover:gap-2">
                  عرض التفاصيل
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
          />
        </div>
      </Container>
    </section>
  );
}
