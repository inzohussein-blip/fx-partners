"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import { formatCurrency, formatCompact } from "@/lib/utils";

export type ChartPoint = {
  month: string;
  earnings: number;
  referrals: number;
};

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-medium text-white">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="text-slate-300">
          {p.name === "earnings"
            ? `الأرباح: ${formatCurrency(Number(p.value))}`
            : `الإحالات: ${p.value}`}
        </div>
      ))}
    </div>
  );
}

const axisProps = {
  stroke: "#64748b",
  tick: { fill: "#94a3b8", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

/** Header row: icon badge + title on one side, a summary figure on the other. */
function ChartHead({
  icon: Icon,
  title,
  summary,
}: {
  icon: typeof BarChart3;
  title: string;
  summary: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <span dir="ltr" className="text-sm font-bold text-brand-300">
        {summary}
      </span>
    </div>
  );
}

/** Overlay shown when a chart has no meaningful data yet. */
function EmptyOverlay({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <p className="rounded-full bg-ink-900/70 px-3 py-1 text-xs text-slate-500">
        {text}
      </p>
    </div>
  );
}

export function EarningsChart({ data }: { data: ChartPoint[] }) {
  const totalEarnings = data.reduce((s, d) => s + d.earnings, 0);
  const totalReferrals = data.reduce((s, d) => s + d.referrals, 0);
  const noEarnings = totalEarnings === 0;
  const noReferrals = totalReferrals === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card-surface p-5 lg:col-span-2">
        <ChartHead
          icon={LineChartIcon}
          title="الأرباح الشهرية"
          summary={`${formatCurrency(totalEarnings)} — آخر ٦ أشهر`}
        />
        <div
          className="relative mt-4 h-64"
          dir="ltr"
          role="img"
          aria-label={`مخطط الأرباح الشهرية لآخر ستة أشهر، الإجمالي ${formatCurrency(totalEarnings)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D1E6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00D1E6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={48} tickFormatter={(v) => formatCompact(Number(v))} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#00D1E6", strokeOpacity: 0.2 }} />
              <Area
                type="monotone"
                dataKey="earnings"
                name="earnings"
                stroke="#00D1E6"
                strokeWidth={2}
                fill="url(#earnGrad)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {noEarnings && <EmptyOverlay text="لا توجد أرباح مسجّلة بعد" />}
        </div>
      </div>

      <div className="card-surface p-5">
        <ChartHead
          icon={BarChart3}
          title="الإحالات الشهرية"
          summary={`${totalReferrals} إحالة`}
        />
        <div
          className="relative mt-4 h-64"
          dir="ltr"
          role="img"
          aria-label={`مخطط الإحالات الشهرية لآخر ستة أشهر، الإجمالي ${totalReferrals} إحالة`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a9cff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#008CFF" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={32} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37,99,235,0.12)" }} />
              <Bar dataKey="referrals" name="referrals" fill="url(#refGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {noReferrals && <EmptyOverlay text="لا توجد إحالات بعد" />}
        </div>
      </div>
    </div>
  );
}
