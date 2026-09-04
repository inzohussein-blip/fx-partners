import { levelFor, TIERS } from "@/lib/levels";
import {
  Award,
  Star,
  Trophy,
  Crown,
  Rocket,
  Users,
  Wallet,
  Banknote,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TIER_ICON: Record<string, LucideIcon> = {
  standard: Rocket,
  silver: Star,
  gold: Trophy,
  vip: Crown,
};

type Stats = {
  referrals: number;
  totalEarned: number;
  withdrawals: number;
};

const BADGES: {
  key: string;
  label: string;
  icon: LucideIcon;
  test: (s: Stats) => boolean;
}[] = [
  { key: "first_ref", label: "أول إحالة", icon: Users, test: (s) => s.referrals >= 1 },
  { key: "ten_ref", label: "10 إحالات", icon: Users, test: (s) => s.referrals >= 10 },
  { key: "fifty_ref", label: "50 إحالة", icon: Award, test: (s) => s.referrals >= 50 },
  { key: "first_earn", label: "أول ربح", icon: Banknote, test: (s) => s.totalEarned > 0 },
  { key: "grand", label: "1,000$ أرباح", icon: Trophy, test: (s) => s.totalEarned >= 1000 },
  { key: "first_wd", label: "أول سحب", icon: Wallet, test: (s) => s.withdrawals >= 1 },
];

export function LevelBadges({ referrals, totalEarned, withdrawals }: Stats) {
  const stats = { referrals, totalEarned, withdrawals };
  const { current, next, progress, toNext } = levelFor(referrals);
  const TierIcon = TIER_ICON[current.key] ?? Rocket;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Level card */}
      <div className="card-surface relative overflow-hidden p-6 lg:col-span-1">
        <div className="hero-glow absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <TierIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">مستواك الحالي</div>
              <div className="text-lg font-bold text-white">{current.label}</div>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-gradient" dir="ltr">
              {current.rate}%
            </span>
            <span className="text-xs text-slate-400">نسبة عمولتك</span>
          </div>

          {next ? (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                <span>{next.label}</span>
                <span dir="ltr">{toNext} إحالة متبقية</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-brand-300">🎉 وصلت لأعلى مستوى!</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="card-surface p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white">الإنجازات</h3>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BADGES.map((b) => {
            const earned = b.test(stats);
            const Icon = earned ? b.icon : Lock;
            return (
              <div
                key={b.key}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                  earned
                    ? "border-brand-500/30 bg-brand-500/10 text-brand-200"
                    : "border-white/5 bg-ink-900/40 text-slate-600"
                }`}
                title={b.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-tight">{b.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          كل {TIERS[1].min} إحالة ترفع مستواك وتزيد نسبة عمولتك تلقائياً.
        </p>
      </div>
    </section>
  );
}
