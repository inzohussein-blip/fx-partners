import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, BadgeCheck, Building2, Star } from "lucide-react";

export type LeaderRow = {
  name: string;
  slug: string;
  logo_url: string | null;
  rating: number;
  reviews_count: number;
  status?: string | null;
};

/** Compact star strip sized for the dense hero table. */
function MiniStars({ value }: { value: number }) {
  return (
    <span className="mt-0.5 flex gap-px text-brand-300" dir="ltr" aria-label={`${value} من 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className="h-2.5 w-2.5"
          fill={i < Math.round(value) ? "currentColor" : "none"}
          strokeWidth={i < Math.round(value) ? 0 : 1.5}
        />
      ))}
    </span>
  );
}

/**
 * Hero visual (foreground) — the broker comparison rendered as a floating app
 * window that overlaps the globe. Leads with concrete product proof (real
 * ratings) and doubles as the entry point into the full comparison.
 */
export function HeroLeaderboard({ brokers }: { brokers: LeaderRow[] }) {
  const rows = brokers.slice(0, 4);

  return (
    <div
      className={cn(
        "w-full max-w-[26rem] overflow-hidden rounded-2xl border backdrop-blur",
        "border-brand-500/30 shadow-[0_50px_110px_-34px_rgba(0,0,0,0.95)]"
      )}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(10,32,54,0.97) 0%, rgba(4,16,30,0.98) 100%)",
        boxShadow:
          "0 50px 110px -34px rgba(0,0,0,0.95), inset 0 1px 0 rgba(84,216,240,0.22)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-brand-500/[0.06] px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#22384f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22384f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22384f]" />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          مقارنة شركات التداول — FX Partners
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[22px_1fr_52px_54px] gap-2 border-b border-white/[0.05] px-4 py-2.5 text-[11px] text-slate-500">
        <span>#</span>
        <span>الشركة</span>
        <span className="text-end">التقييم</span>
        <span className="text-end">مراجعات</span>
      </div>

      {/* Rows */}
      <ul>
        {rows.map((b, i) => (
          <li
            key={b.slug}
            className={cn(
              "grid grid-cols-[22px_1fr_52px_54px] items-center gap-2 border-b border-white/[0.05] px-4 py-3",
              i === 0 && "bg-gradient-to-l from-brand-500/[0.2] to-transparent"
            )}
          >
            <span
              className={cn(
                "grid h-[21px] w-[21px] place-items-center rounded-md text-[11px] font-extrabold",
                i === 0
                  ? "bg-brand-gradient text-white"
                  : "bg-white/5 text-slate-400"
              )}
            >
              {i + 1}
            </span>

            <div className="flex min-w-0 items-center gap-2.5">
              {b.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  loading="lazy"
                  decoding="async"
                  src={b.logo_url}
                  alt={b.name}
                  className="h-[31px] w-[31px] shrink-0 rounded-lg object-contain"
                />
              ) : (
                <span className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-300">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate text-[13px] font-bold text-white">{b.name}</span>
                  {b.status === "partnered" && (
                    <BadgeCheck className="h-3 w-3 shrink-0 text-brand-300" />
                  )}
                </div>
                <MiniStars value={b.rating} />
              </div>
            </div>

            <div className="text-end text-base font-extrabold text-brand-300" dir="ltr">
              {b.rating.toFixed(1)}
            </div>
            <div className="text-end text-[10px] text-slate-500" dir="ltr">
              {b.reviews_count}+
            </div>
          </li>
        ))}
      </ul>

      {/* Footer CTA */}
      <Link
        href="/compare"
        className="flex items-center justify-center gap-2 bg-brand-500/[0.07] px-5 py-3.5 text-[13px] font-bold text-brand-100 transition hover:bg-brand-500/[0.14] hover:text-white"
      >
        قارن كل الشركات
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}
