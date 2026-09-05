import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { TIERS } from "@/lib/levels";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Medal, Crown, Star, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type Row = {
  rank: number;
  masked_code: string;
  tier: string;
  referrals: number;
  total_earned: number;
  is_me: boolean;
};

const TIER_LABEL: Record<string, string> = Object.fromEntries(
  TIERS.map((t) => [t.key, t.label])
);

const TIER_ICON: Record<string, LucideIcon> = {
  standard: Rocket,
  silver: Star,
  gold: Trophy,
  vip: Crown,
};

/** Deterministic demo board so the page never looks empty before real data. */
function demoRows(): Row[] {
  const tiers = ["vip", "vip", "gold", "gold", "gold", "silver", "silver", "silver", "standard", "standard"];
  return Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    masked_code: `IB••••${String((97 - i * 7) % 100).padStart(2, "0")}`,
    tier: tiers[i],
    referrals: Math.max(3, 420 - i * 41 - (i % 2) * 7),
    total_earned: Math.max(200, 48000 - i * 4600 - (i % 3) * 300),
    is_me: false,
  }));
}

async function getRows(): Promise<{ rows: Row[]; live: boolean }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { rows: demoRows(), live: false };
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("leaderboard", { limit_n: 10 });
    if (error || !data || data.length === 0) {
      return { rows: demoRows(), live: false };
    }
    return {
      rows: (data as Row[]).map((r) => ({
        ...r,
        referrals: Number(r.referrals),
        total_earned: Number(r.total_earned),
      })),
      live: true,
    };
  } catch {
    return { rows: demoRows(), live: false };
  }
}

function rankBadge(rank: number) {
  if (rank === 1) return { color: "text-amber-300", ring: "ring-amber-400/40", Icon: Trophy };
  if (rank === 2) return { color: "text-slate-300", ring: "ring-slate-300/30", Icon: Medal };
  if (rank === 3) return { color: "text-orange-300", ring: "ring-orange-400/30", Icon: Medal };
  return { color: "text-slate-500", ring: "ring-white/10", Icon: Medal };
}

export default async function LeaderboardPage() {
  const { rows, live } = await getRows();

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Trophy}
        title={"لوحة المتصدّرين"}
        subtitle={"أفضل 10 وكلاء هذا الموسم — بالأداء لا بالأسماء. الهويات مجهّلة برمز الوكيل (IB) لحماية الخصوصية."}
      />

      {/* Podium — top 3 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 0, 2].map((idx) => {
          const r = rows[idx];
          if (!r) return <div key={idx} />;
          const { color, ring, Icon } = rankBadge(r.rank);
          const TierIcon = TIER_ICON[r.tier] ?? Rocket;
          const tall = r.rank === 1;
          return (
            <div
              key={r.masked_code + r.rank}
              className={`card-surface relative overflow-hidden p-6 text-center ${
                tall ? "sm:-mt-4 sm:pb-8" : ""
              } ${r.is_me ? "ring-2 ring-brand-400/60" : ""}`}
            >
              {tall && <div className="hero-glow absolute inset-0 opacity-60" />}
              <div className="relative">
                <div
                  className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-900/60 ring-2 ${ring} ${color}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-3 text-xs text-slate-400">المركز {r.rank}</div>
                <div className="mt-1 font-mono text-lg font-bold text-white" dir="ltr">
                  {r.masked_code}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-xs text-brand-200">
                  <TierIcon className="h-3.5 w-3.5" />
                  {TIER_LABEL[r.tier] ?? r.tier}
                </div>
                <div className="mt-4 text-2xl font-extrabold text-gradient" dir="ltr">
                  {formatCurrency(r.total_earned)}
                </div>
                <div className="text-xs text-slate-500">{r.referrals} إحالة</div>
                {r.is_me && (
                  <div className="mt-2 text-xs font-semibold text-brand-300">أنت</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <section className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">رمز الوكيل</th>
                <th className="px-5 py-3 font-medium">المستوى</th>
                <th className="px-5 py-3 font-medium">الإحالات</th>
                <th className="px-5 py-3 font-medium">إجمالي الأرباح</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const { color } = rankBadge(r.rank);
                const TierIcon = TIER_ICON[r.tier] ?? Rocket;
                return (
                  <tr
                    key={r.masked_code + r.rank}
                    className={`border-b border-white/5 transition last:border-0 ${
                      r.is_me ? "bg-brand-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className={`px-5 py-3 font-bold ${color}`}>{r.rank}</td>
                    <td className="px-5 py-3 font-mono text-white" dir="ltr">
                      {r.masked_code}
                      {r.is_me && (
                        <span className="ms-2 rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] text-brand-200">
                          أنت
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <TierIcon className="h-4 w-4 text-brand-300" />
                        {TIER_LABEL[r.tier] ?? r.tier}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300" dir="ltr">
                      {r.referrals}
                    </td>
                    <td className="px-5 py-3 font-semibold text-brand-300" dir="ltr">
                      {formatCurrency(r.total_earned)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        {live
          ? "يتم التحديث تلقائياً وتُقرَّب الأرباح لأقرب 100$ حفاظاً على الخصوصية."
          : "بيانات تجريبية للعرض — ستظهر النتائج الحقيقية فور اعتماد الوكلاء وتسجيل الأرباح."}
      </p>
    </div>
  );
}
