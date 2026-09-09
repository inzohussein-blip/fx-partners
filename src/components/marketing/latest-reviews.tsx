import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/brokers/stars";
import { Avatar } from "@/components/forum/avatar";
import { MessageSquareQuote, Building2, ArrowLeft } from "lucide-react";

type ReviewRow = {
  id: string;
  user_name: string | null;
  comment: string;
  stars: number;
  created_at: string;
  broker: { name: string; slug: string; logo_url: string | null } | null;
};

async function getLatestReviews(): Promise<ReviewRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("broker_reviews")
      .select("id,user_name,comment,stars,created_at,broker:brokers!inner(name,slug,logo_url)")
      .eq("is_approved", true)
      .eq("is_admin_reply", false)
      .order("created_at", { ascending: false })
      .limit(5);
    return (data as unknown as ReviewRow[] | null) ?? [];
  } catch {
    return [];
  }
}

/** Relative "time ago" in the active locale. */
function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return rtf.format(-mins, "minute");
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return rtf.format(-hrs, "hour");
  const days = Math.round(hrs / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

/** "Latest Reviews" — recent approved user reviews across every broker. */
export async function LatestReviews() {
  const t = await getTranslations("LatestReviews");
  const locale = await getLocale();
  const reviews = await getLatestReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              {t("badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{t("heading")}</h2>
            <p className="mt-3 max-w-xl text-slate-400">{t("subheading")}</p>
          </div>
          <Link
            href="/brokers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:gap-2.5 hover:text-brand-200"
          >
            {t("viewAll")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <Link
                href={r.broker ? `/brokers/${r.broker.slug}` : "/brokers"}
                className="card-surface group flex h-full gap-4 p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
              >
                <Avatar name={r.user_name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-white">
                      {r.user_name || "متداول"}
                    </span>
                    <Stars value={r.stars} size={14} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    {r.broker?.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.broker.logo_url} alt="" className="h-3.5 w-3.5 rounded bg-white/80 object-contain" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" />
                    )}
                    <span className="truncate text-brand-300">{r.broker?.name}</span>
                    <span aria-hidden>·</span>
                    <time>{timeAgo(r.created_at, locale)}</time>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">
                    {r.comment}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
