import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { cn } from "@/lib/utils";
import { Trophy, Building2, ArrowLeft, BadgeCheck } from "lucide-react";

export type LeaderRow = {
  name: string;
  slug: string;
  logo_url: string | null;
  rating: number;
  reviews_count: number;
  status?: string | null;
};

/**
 * Hero visual — a premium glass "leaderboard" card that shows the top-rated
 * brokers we connect to. It leads with concrete product proof (real scores),
 * which reads far less generic than an abstract diagram, and it doubles as an
 * entry point into the full comparison.
 */
export function HeroLeaderboard({ brokers }: { brokers: LeaderRow[] }) {
  const rows = brokers.slice(0, 4);

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Soft brand glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(60% 60% at 72% 8%, rgba(201,162,39,0.28) 0%, transparent 70%), radial-gradient(50% 50% at 20% 90%, rgba(230,193,90,0.18) 0%, transparent 72%)",
        }}
      />

      {/* Floating average-rating chip */}
      <div className="absolute -top-4 start-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/90 px-3 py-1.5 shadow-glow backdrop-blur">
        <BadgeCheck className="h-4 w-4 text-brand-300" />
        <span className="text-xs font-semibold text-slate-200">تقييمات موثّقة</span>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-white">الشركات الأعلى تقييماً</div>
              <div className="text-[11px] text-slate-400">من شبكة الشركات المرخّصة</div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
            مُحدّث
          </span>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-white/5">
          {rows.map((b, i) => (
            <li key={b.slug} className="flex items-center gap-3 px-5 py-3.5">
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-extrabold",
                  i === 0
                    ? "bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30"
                    : "bg-white/5 text-slate-400"
                )}
              >
                {i + 1}
              </span>

              {b.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  loading="lazy"
                  decoding="async"
                  src={b.logo_url}
                  alt={b.name}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain"
                />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-brand-300">
                  <Building2 className="h-4 w-4" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-white">{b.name}</span>
                  {b.status === "partnered" && (
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-300" />
                  )}
                </div>
                <div className="mt-0.5">
                  <Stars value={b.rating} size={12} />
                </div>
              </div>

              <div className="text-end">
                <div className="text-lg font-extrabold leading-none text-brand-300" dir="ltr">
                  {b.rating.toFixed(1)}
                </div>
                <div className="mt-1 text-[10px] text-slate-500" dir="ltr">
                  {b.reviews_count}+ مراجعة
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer CTA */}
        <Link
          href="/compare"
          className="flex items-center justify-center gap-2 border-t border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-brand-200 transition hover:bg-white/[0.07] hover:text-brand-100"
        >
          قارن كل الشركات
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
