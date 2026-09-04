import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { EarningsChart, type ChartPoint } from "@/components/dashboard/earnings-chart";
import { LevelBadges } from "@/components/dashboard/level-badges";
import {
  PerformancePanel,
  type StatusCounts,
} from "@/components/dashboard/performance-panel";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { Wallet, TrendingUp, Users, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Overview = {
  balance: number;
  totalEarned: number;
  pending: number;
  volume: number;
  referrals: number;
  links: number;
  withdrawals: number;
  statusCounts: StatusCounts;
  recent: { description: string; amount: number; earned_at: string }[];
  series: ChartPoint[];
};

/** Build 6 zero-filled monthly buckets (oldest → newest). */
function buildSeries(
  earnings: { amount: number; earned_at: string }[],
  refs: { created_at?: string }[]
): ChartPoint[] {
  const now = new Date();
  const buckets: { key: string; point: ChartPoint }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      point: {
        month: d.toLocaleDateString("ar", { month: "short" }),
        earnings: 0,
        referrals: 0,
      },
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b.point]));
  const keyOf = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}`;
  };
  for (const e of earnings) {
    const p = index.get(keyOf(e.earned_at) ?? "");
    if (p) p.earnings += Number(e.amount ?? 0);
  }
  for (const r of refs) {
    const p = index.get(keyOf(r.created_at) ?? "");
    if (p) p.referrals += 1;
  }
  return buckets.map((b) => b.point);
}

async function getOverview(): Promise<Overview> {
  const empty: Overview = {
    balance: 0,
    totalEarned: 0,
    pending: 0,
    volume: 0,
    referrals: 0,
    links: 0,
    withdrawals: 0,
    statusCounts: { lead: 0, registered: 0, funded: 0, active: 0 },
    recent: [],
    series: buildSeries([], []),
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const { data: ib } = await supabase
      .from("ib_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ib) return empty;

    const [
      { data: wallet },
      { data: refs },
      { data: links },
      { data: earnings },
      { count: withdrawalCount },
    ] = await Promise.all([
      supabase
        .from("wallets")
        .select("balance,total_earned,pending_balance")
        .eq("ib_id", ib.id)
        .maybeSingle(),
      supabase
        .from("referrals")
        .select("trading_volume,created_at,status")
        .eq("ib_id", ib.id),
      supabase.from("referral_links").select("id").eq("ib_id", ib.id),
      supabase
        .from("earnings")
        .select("description,amount,earned_at")
        .eq("ib_id", ib.id)
        .order("earned_at", { ascending: false })
        .limit(200),
      supabase
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("ib_id", ib.id),
    ]);

    const volume = (refs ?? []).reduce(
      (sum, r) => sum + Number(r.trading_volume ?? 0),
      0
    );

    const statusCounts: StatusCounts = { lead: 0, registered: 0, funded: 0, active: 0 };
    for (const r of refs ?? []) {
      const s = (r as { status?: string }).status;
      if (s === "registered") statusCounts.registered += 1;
      else if (s === "funded") statusCounts.funded += 1;
      else if (s === "active") statusCounts.active += 1;
      else statusCounts.lead += 1;
    }

    return {
      balance: Number(wallet?.balance ?? 0),
      totalEarned: Number(wallet?.total_earned ?? 0),
      pending: Number(wallet?.pending_balance ?? 0),
      volume,
      referrals: refs?.length ?? 0,
      links: links?.length ?? 0,
      withdrawals: withdrawalCount ?? 0,
      statusCounts,
      recent: (earnings ?? []).slice(0, 5),
      series: buildSeries(earnings ?? [], refs ?? []),
    };
  } catch {
    return empty;
  }
}

export default async function OverviewPage() {
  const o = await getOverview();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">النظرة العامة</h1>
        <p className="mt-1 text-sm text-slate-400">
          ملخّص حيّ لأرباحك وحجم التداول والإحالات.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الرصيد المتاح"
          value={formatCurrency(o.balance)}
          icon={Wallet}
          hint="قابل للسحب"
        />
        <StatCard
          label="إجمالي الأرباح"
          value={formatCurrency(o.totalEarned)}
          icon={TrendingUp}
        />
        <StatCard
          label="حجم التداول"
          value={formatCompact(o.volume)}
          icon={TrendingUp}
          hint="لوت / إجمالي"
        />
        <StatCard
          label="عدد الإحالات"
          value={String(o.referrals)}
          icon={Users}
          hint={`${o.links} رابط إحالة`}
        />
      </div>

      <LevelBadges
        referrals={o.referrals}
        totalEarned={o.totalEarned}
        withdrawals={o.withdrawals}
      />

      <PerformancePanel series={o.series} counts={o.statusCounts} />

      <EarningsChart data={o.series} />

      <section className="card-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">آخر الأرباح</h2>
          <Link2 className="h-4 w-4 text-slate-500" />
        </div>

        {o.recent.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            لا توجد أرباح مسجّلة بعد. ابدأ بمشاركة روابط الإحالة من{" "}
            <span className="text-brand-300">أدوات التسويق</span>.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {o.recent.map((e, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-white">
                    {e.description ?? "عمولة"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(e.earned_at).toLocaleDateString("ar")}
                  </p>
                </div>
                <span className="font-semibold text-brand-300">
                  +{formatCurrency(Number(e.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
