import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/brokers/stars";
import { Award, Building2, BadgeCheck, ArrowLeft } from "lucide-react";

type TopBroker = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  status: string;
  rating: number;
  reviews_count: number;
};

async function getTopBrokers(): Promise<TopBroker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("id,slug,name,logo_url,status,rating,reviews_count")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .order("reviews_count", { ascending: false })
      .limit(6);
    return (data as TopBroker[] | null) ?? [];
  } catch {
    return [];
  }
}

/**
 * "Top Rated Brokers" — the review-platform proof grid (per the brand brief).
 * Clean cards: logo, name, cyan star rating + score, review count, read-review.
 * Ratings are the hero of each card. Renders nothing until brokers exist.
 */
export async function TopRatedBrokers() {
  const t = await getTranslations("TopBrokers");
  const brokers = await getTopBrokers();
  if (brokers.length === 0) return null;

  return (
    <section className="ambient-section py-16 sm:py-20">
      <span
        className="ambient inset-x-1/3 top-0 h-64"
        style={{ background: "radial-gradient(circle, rgba(84,216,240,0.18) 0%, transparent 70%)" }}
        aria-hidden
      />
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <Award className="h-3.5 w-3.5" />
              {t("badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{t("heading")}</h2>
            <p className="mt-3 max-w-xl text-slate-400">{t("subheading")}</p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:gap-2.5 hover:text-brand-200"
          >
            {t("viewAll")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brokers.map((b, i) => (
            <article
              key={b.id}
              className="card-surface group relative flex flex-col p-6 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
            >
              {i === 0 && (
                <span className="absolute end-5 top-5 inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold text-brand-200">
                  <Award className="h-3 w-3" /> #1
                </span>
              )}
              <div className="flex items-center gap-3">
                {b.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 rounded-xl bg-white/5 object-contain p-1"
                  />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-brand-300">
                    <Building2 className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-white">{b.name}</h3>
                  {b.status === "partnered" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                      <BadgeCheck className="h-3 w-3" /> شريك معتمد
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-3xl font-extrabold leading-none text-gradient" dir="ltr">
                  {b.rating.toFixed(1)}
                </span>
                <div className="flex flex-col">
                  <Stars value={b.rating} size={15} />
                  <span className="mt-1 text-[11px] text-slate-500" dir="ltr">
                    {b.reviews_count.toLocaleString("en-US")} {t("reviews")}
                  </span>
                </div>
              </div>

              <Link
                href={`/brokers/${b.slug}`}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white"
              >
                {t("readReview")}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
