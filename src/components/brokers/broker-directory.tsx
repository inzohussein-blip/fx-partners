"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { statusLabel, regulatorMeta, type Broker } from "@/lib/brokers";
import { cn } from "@/lib/utils";
import { BadgeCheck, Gift, Search, ArrowLeft, Building2 } from "lucide-react";

type Filter = "all" | "partnered" | "not_partnered" | "bonus";
type Sort = "rating" | "reviews" | "name" | "spread";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "partnered", label: "شركاء معتمدون" },
  { key: "not_partnered", label: "غير متعاقد" },
  { key: "bonus", label: "يقدّم بونص" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "rating", label: "الأعلى تقييماً" },
  { key: "spread", label: "أقل سبريد" },
  { key: "reviews", label: "الأكثر مراجعات" },
  { key: "name", label: "الاسم" },
];

// Advanced sidebar-style toggle filters.
const TOGGLES: { key: "bonus_no_deposit" | "bonus_withdrawable" | "supports_gold"; label: string }[] = [
  { key: "bonus_no_deposit", label: "بونص بدون إيداع" },
  { key: "bonus_withdrawable", label: "بونص قابل للسحب" },
  { key: "supports_gold", label: "يدعم تداول الذهب" },
];

function bestCommission(b: Broker): string | null {
  const links = b.broker_links ?? [];
  const withC = links.find((l) => l.agent_commission);
  return withC?.agent_commission ?? null;
}

function LicenseBadges({ licenses }: { licenses?: string[] }) {
  const list = (licenses ?? []).map((k) => regulatorMeta(k)).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((r, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
        >
          {r!.flag} {r!.label}
        </span>
      ))}
    </div>
  );
}

export function BrokerDirectory({ brokers }: { brokers: Broker[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [q, setQ] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    let list = brokers.slice();
    if (filter === "partnered") list = list.filter((b) => b.status === "partnered");
    else if (filter === "not_partnered")
      list = list.filter((b) => b.status === "not_partnered");
    else if (filter === "bonus")
      list = list.filter((b) => b.deposit_bonus || b.welcome_bonus);

    for (const tg of TOGGLES) {
      if (toggles[tg.key]) list = list.filter((b) => Boolean(b[tg.key]));
    }

    const query = q.trim().toLowerCase();
    if (query) list = list.filter((b) => b.name.toLowerCase().includes(query));

    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "reviews") return b.reviews_count - a.reviews_count;
      if (sort === "spread") {
        const sa = a.spread_from ?? Infinity;
        const sb = b.spread_from ?? Infinity;
        return sa - sb;
      }
      return a.name.localeCompare(b.name, "ar");
    });
    return list;
  }, [brokers, filter, sort, q, toggles]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                filter === f.key
                  ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30"
                  : "bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن شركة…"
              className="w-44 rounded-xl border border-white/10 bg-ink-900/60 py-2 pe-4 ps-9 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-white focus:border-brand-500/50 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced toggle filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">فلترة دقيقة:</span>
        {TOGGLES.map((tg) => {
          const on = !!toggles[tg.key];
          return (
            <button
              key={tg.key}
              onClick={() => setToggles((s) => ({ ...s, [tg.key]: !s[tg.key] }))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition",
                on
                  ? "bg-brand-500/15 text-brand-200 ring-brand-500/30"
                  : "bg-white/5 text-slate-400 ring-white/10 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-3.5 w-3.5 place-items-center rounded-sm border text-[9px]",
                  on ? "border-brand-400 bg-brand-500 text-white" : "border-white/20"
                )}
              >
                {on ? "✓" : ""}
              </span>
              {tg.label}
            </button>
          );
        })}
      </div>

      {/* Comparison table (desktop) */}
      <div className="card-surface hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">الشركة</th>
                <th className="px-5 py-3 font-medium">الحالة</th>
                <th className="px-5 py-3 font-medium">التقييم</th>
                <th className="px-5 py-3 font-medium">السبريد من</th>
                <th className="px-5 py-3 font-medium">بونص الإيداع</th>
                <th className="px-5 py-3 font-medium">بونص ترحيبي</th>
                <th className="px-5 py-3 font-medium">عمولة الوكيل</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <BrokerLogo broker={b} />
                      <div>
                        <span className="font-semibold text-white">{b.name}</span>
                        {b.badges && b.badges.length > 0 && (
                          <div className="mt-1">
                            <BrokerBadges badges={b.badges} />
                          </div>
                        )}
                        {b.licenses && b.licenses.length > 0 && (
                          <div className="mt-1">
                            <LicenseBadges licenses={b.licenses} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Stars value={b.rating} />
                      <span className="text-xs text-slate-500" dir="ltr">
                        {b.rating.toFixed(1)} ({b.reviews_count})
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300" dir="ltr">
                    {b.spread_from != null ? `${b.spread_from} نقطة` : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {b.deposit_bonus || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {b.welcome_bonus || "—"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-brand-300">
                    {bestCommission(b) || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/25"
                    >
                      التفاصيل
                      <ArrowLeft className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards (mobile) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {rows.map((b) => (
          <Link
            key={b.id}
            href={`/brokers/${b.slug}`}
            className="card-surface block p-5 transition hover:ring-1 hover:ring-brand-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrokerLogo broker={b} />
                <span className="font-semibold text-white">{b.name}</span>
              </div>
              <StatusBadge status={b.status} />
            </div>
            {b.badges && b.badges.length > 0 && (
              <div className="mt-3">
                <BrokerBadges badges={b.badges} />
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Stars value={b.rating} />
              <span className="text-xs text-slate-500" dir="ltr">
                {b.rating.toFixed(1)} ({b.reviews_count})
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {b.spread_from != null && (
                <span className="rounded-full bg-white/5 px-2 py-1 text-slate-300" dir="ltr">
                  سبريد {b.spread_from}
                </span>
              )}
              {b.deposit_bonus && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">
                  <Gift className="h-3 w-3" /> إيداع {b.deposit_bonus}
                </span>
              )}
              {bestCommission(b) && (
                <span className="rounded-full bg-brand-500/10 px-2 py-1 text-brand-200">
                  وكيل: {bestCommission(b)}
                </span>
              )}
            </div>
            {b.licenses && b.licenses.length > 0 && (
              <div className="mt-2">
                <LicenseBadges licenses={b.licenses} />
              </div>
            )}
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="card-surface p-10 text-center text-sm text-slate-500">
          لا توجد شركات مطابقة لبحثك.
        </div>
      )}
    </div>
  );
}

function BrokerLogo({ broker }: { broker: Broker }) {
  if (broker.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={broker.logo_url}
        alt={broker.name}
        className="h-9 w-9 rounded-lg object-contain"
      />
    );
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-brand-300">
      <Building2 className="h-4 w-4" />
    </span>
  );
}

function StatusBadge({ status }: { status: Broker["status"] }) {
  const partnered = status === "partnered";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        partnered
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-white/5 text-slate-400"
      )}
    >
      {partnered && <BadgeCheck className="h-3 w-3" />}
      {statusLabel(status)}
    </span>
  );
}
