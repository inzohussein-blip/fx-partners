"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { MousePointerClick, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClickDay, CountryRow } from "@/lib/clicks";

const axisProps = {
  stroke: "#64748b",
  tick: { fill: "#94a3b8", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

/** "2026-09-11" → "11/09", the only part that fits a phone axis. */
function shortDay(iso: string): string {
  const [, m, d] = iso.split("-");
  return d && m ? `${d}/${m}` : iso;
}

function ClickTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-medium text-white">{label}</div>
      <div className="text-slate-300">نقرات: {payload[0]?.value ?? 0}</div>
    </div>
  );
}

/**
 * Daily click chart with a range toggle and a country breakdown.
 *
 * The full series is fetched once and sliced in the browser, so switching
 * between 7 and 30 days is instant and costs no round trip.
 *
 * An empty result renders as an explicit "no clicks yet" rather than a chart
 * of zeros — a flat line at zero reads as a broken chart, and on a page whose
 * whole job is reporting, that ambiguity is the thing to avoid.
 */
export function ClickAnalytics({
  title,
  subtitle,
  series,
  countries,
  className,
}: {
  title: string;
  subtitle?: string;
  series: ClickDay[];
  countries: CountryRow[];
  className?: string;
}) {
  const [days, setDays] = useState<7 | 30>(30);

  const data = useMemo(
    () => series.slice(-days).map((d) => ({ day: shortDay(d.day), clicks: d.clicks })),
    [series, days]
  );
  const total = useMemo(() => data.reduce((n, d) => n + d.clicks, 0), [data]);
  const maxCountry = Math.max(1, ...countries.map((c) => c.clicks));

  return (
    <section className={cn("card-surface p-4 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
            <MousePointerClick className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white sm:text-base">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-gradient sm:text-xl" dir="ltr">
            {total.toLocaleString("en-US")}
          </span>
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                aria-pressed={days === d}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-semibold transition",
                  days === d
                    ? "bg-brand-500/20 text-brand-200"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {d} يوم
              </button>
            ))}
          </div>
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
          لا توجد نقرات في هذه الفترة بعد.
        </p>
      ) : (
        <>
          <div className="mt-5 h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
                <YAxis {...axisProps} allowDecimals={false} width={40} />
                <Tooltip content={<ClickTooltip />} cursor={{ fill: "rgba(0,144,252,0.08)" }} />
                <Bar dataKey="clicks" fill="#0090FC" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {countries.length > 0 && (
            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Globe className="h-3.5 w-3.5" />
                الدول الأكثر نقراً
              </div>
              <ul className="space-y-2">
                {countries.slice(0, 6).map((c) => (
                  <li key={c.country} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-xs font-medium text-slate-300" dir="ltr">
                      {c.country}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <span
                        className="block h-full rounded-full bg-brand-gradient"
                        style={{ width: `${(c.clicks / maxCountry) * 100}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-end text-xs text-slate-500" dir="ltr">
                      {c.clicks}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
