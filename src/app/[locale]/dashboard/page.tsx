import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { EarningsChart, type ChartPoint } from "@/components/dashboard/earnings-chart";
import { LevelBadges } from "@/components/dashboard/level-badges";
import {
  PerformancePanel,
  type StatusCounts,
} from "@/components/dashboard/performance-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  ProfileProgress,
  type OnboardingStep,
} from "@/components/dashboard/profile-progress";
import { Link } from "@/i18n/navigation";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { Wallet, TrendingUp, Users, Link2, LayoutDashboard, Sparkles } from "lucide-react";

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

async function getOnboardingSteps(): Promise<OnboardingStep[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: ib } = await supabase
      .from("ib_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ib) return null;

    const [{ data: profile }, { data: links }, { data: refs }, { data: agreement }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,telegram_chat_id")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("referral_links").select("id").eq("ib_id", ib.id).limit(1),
        supabase.from("referrals").select("id").eq("ib_id", ib.id).limit(1),
        supabase.from("agreements").select("id").eq("user_id", user.id).limit(1),
      ]);

    return [
      {
        id: "name",
        label: "أكمل اسمك في الإعدادات",
        completed: !!(profile?.full_name && profile.full_name.length > 2),
        href: "/dashboard/settings",
      },
      {
        id: "agreement",
        label: "وقّع اتفاقية الشراكة",
        completed: (agreement?.length ?? 0) > 0,
        href: "/dashboard/agreement",
      },
      {
        id: "link",
        label: "أنشئ أول رابط إحالة",
        completed: (links?.length ?? 0) > 0,
        href: "/dashboard/marketing",
      },
      {
        id: "telegram",
        label: "اربط تلغرام للتنبيهات",
        completed: !!profile?.telegram_chat_id,
        href: "/dashboard/settings",
      },
      {
        id: "referral",
        label: "احصل على أول عميل مُحال",
        completed: (refs?.length ?? 0) > 0,
        href: "/dashboard/marketing",
      },
    ];
  } catch {
    return null;
  }
}

export default async function OverviewPage() {
  const [o, steps] = await Promise.all([getOverview(), getOnboardingSteps()]);
  const showOnboarding = steps && steps.some((s) => !s.completed);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="النظرة العامة"
        subtitle="ملخّص حيّ لأرباحك وحجم التداول والإحالات."
      />

      {showOnboarding && <ProfileProgress steps={steps} />}

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
          <EmptyState
            icon={Sparkles}
            title="لا توجد أرباح مسجّلة بعد"
            description="ابدأ بمشاركة روابط الإحالة الخاصة بك، وستظهر أرباحك هنا فور تحقّقها."
            action={
              <Link
                href="/dashboard/marketing"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                أدوات التسويق
              </Link>
            }
          />
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
