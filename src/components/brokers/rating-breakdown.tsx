import { ShieldCheck, TrendingUp, Gift, Users } from "lucide-react";
import type { Broker } from "@/lib/brokers";

type Dimension = { icon: typeof ShieldCheck; label: string; score: number };

/** Parse the leading number out of a spread like "0.2" or "من 0.0". */
function spreadScore(spread?: number | null): number | null {
  if (spread == null || Number.isNaN(spread)) return null;
  if (spread <= 0.1) return 4.9;
  if (spread <= 0.3) return 4.6;
  if (spread <= 0.7) return 4.2;
  if (spread <= 1.2) return 3.8;
  return 3.3;
}

function regulationScore(licenses?: string[]): number | null {
  const n = licenses?.filter(Boolean).length ?? 0;
  if (n === 0) return null; // don't fabricate — omit when unknown
  if (n >= 3) return 4.9;
  if (n === 2) return 4.4;
  return 3.8;
}

function bonusScore(b: Broker): number | null {
  let s = 0;
  if (b.deposit_bonus) s += 1.5;
  if (b.welcome_bonus) s += 1.5;
  if (b.bonus_no_deposit) s += 1;
  if (b.bonus_withdrawable) s += 1;
  if (s === 0) return null;
  return Math.min(5, 3 + s);
}

/**
 * Rating breakdown derived ONLY from real broker attributes — community rating
 * from actual reviews, regulation from the number of licenses, trading
 * conditions from the spread, bonuses from the bonus flags. Dimensions with no
 * data are omitted rather than invented.
 */
export function RatingBreakdown({ broker }: { broker: Broker }) {
  const dims: Dimension[] = [];
  if (broker.reviews_count > 0 && broker.rating > 0) {
    dims.push({ icon: Users, label: "تقييم المجتمع", score: broker.rating });
  }
  const reg = regulationScore(broker.licenses);
  if (reg != null) dims.push({ icon: ShieldCheck, label: "التنظيم والتراخيص", score: reg });
  const cond = spreadScore(broker.spread_from);
  if (cond != null) dims.push({ icon: TrendingUp, label: "ظروف التداول", score: cond });
  const bonus = bonusScore(broker);
  if (bonus != null) dims.push({ icon: Gift, label: "المكافآت والعروض", score: bonus });

  if (dims.length === 0) return null;

  const overall =
    broker.rating > 0
      ? broker.rating
      : dims.reduce((s, d) => s + d.score, 0) / dims.length;

  return (
    <div className="card-surface p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Overall score dial */}
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:text-center">
          <div className="text-5xl font-extrabold leading-none text-gradient" dir="ltr">
            {overall.toFixed(1)}
          </div>
          <div>
            <div className="text-xs text-slate-500">من 5</div>
            {broker.reviews_count > 0 && (
              <div className="mt-1 text-xs text-slate-400">
                {broker.reviews_count.toLocaleString("en-US")} تقييم
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-white/10 sm:block" />

        {/* Dimension bars */}
        <div className="flex-1 space-y-4">
          {dims.map((d) => (
            <div key={d.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <d.icon className="h-4 w-4 text-brand-300" />
                  {d.label}
                </span>
                <span className="font-semibold text-white" dir="ltr">
                  {d.score.toFixed(1)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${(d.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
        تقييم استرشادي مبنيّ على تقييمات المستخدمين الحقيقية وبيانات الشركة المتاحة (التراخيص، السبريد، العروض).
      </p>
    </div>
  );
}
