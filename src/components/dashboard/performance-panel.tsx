import { formatCurrency } from "@/lib/utils";
import type { ChartPoint } from "@/components/dashboard/earnings-chart";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export type StatusCounts = {
  lead: number;
  registered: number;
  funded: number;
  active: number;
};

const SEGMENTS = [
  { key: "active", label: "نشط", color: "#22d3ee" },
  { key: "funded", label: "مموّل", color: "#2563eb" },
  { key: "registered", label: "مسجّل", color: "#8b5cf6" },
  { key: "lead", label: "مهتم", color: "#475569" },
] as const;

/** Pure-SVG donut — no chart library. */
function Donut({ counts }: { counts: StatusCounts }) {
  const total =
    counts.lead + counts.registered + counts.funded + counts.active || 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="16"
        />
        {total > 0 &&
          SEGMENTS.map((s) => {
            const value = counts[s.key];
            if (value <= 0) return null;
            const frac = value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={s.key}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-white">{total}</div>
          <div className="text-[10px] text-slate-500">إجمالي العملاء</div>
        </div>
      </div>
    </div>
  );
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
        <Minus className="h-3 w-3" /> جديد
      </span>
    );
  }
  const up = pct >= 0;
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        up ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {Math.round(pct)}%
    </span>
  );
}

/** Mini sparkline from the monthly series. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96;
  const h = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w;
    const y = h - ((v - min) / span) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-24" preserveAspectRatio="none">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function deltaPct(current: number, prev: number): number | null {
  if (prev === 0) return current > 0 ? null : 0;
  return ((current - prev) / prev) * 100;
}

export function PerformancePanel({
  series,
  counts,
}: {
  series: ChartPoint[];
  counts: StatusCounts;
}) {
  const n = series.length;
  const curEarn = series[n - 1]?.earnings ?? 0;
  const prevEarn = series[n - 2]?.earnings ?? 0;
  const curRef = series[n - 1]?.referrals ?? 0;
  const prevRef = series[n - 2]?.referrals ?? 0;

  const total =
    counts.lead + counts.registered + counts.funded + counts.active || 0;
  const conversion = total > 0 ? ((counts.funded + counts.active) / total) * 100 : 0;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Donut breakdown */}
      <div className="card-surface p-6">
        <h3 className="text-sm font-semibold text-white">توزيع العملاء</h3>
        <div className="mt-4 flex items-center gap-5">
          <Donut counts={counts} />
          <ul className="space-y-2 text-sm">
            {SEGMENTS.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-slate-400">{s.label}</span>
                <span className="font-semibold text-white">{counts[s.key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delta KPIs */}
      <div className="card-surface p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white">الأداء الشهري</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">أرباح الشهر</span>
              <Delta pct={deltaPct(curEarn, prevEarn)} />
            </div>
            <div dir="ltr" className="mt-1.5 text-xl font-bold text-white">
              {formatCurrency(curEarn)}
            </div>
            <div className="mt-2">
              <Sparkline values={series.map((s) => s.earnings)} color="#22d3ee" />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">إحالات الشهر</span>
              <Delta pct={deltaPct(curRef, prevRef)} />
            </div>
            <div dir="ltr" className="mt-1.5 text-xl font-bold text-white">
              {curRef}
            </div>
            <div className="mt-2">
              <Sparkline values={series.map((s) => s.referrals)} color="#2563eb" />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">معدّل التحويل</span>
            </div>
            <div dir="ltr" className="mt-1.5 text-xl font-bold text-white">
              {Math.round(conversion)}%
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${Math.min(100, conversion)}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-600">
              مموّل + نشط من الإجمالي
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
