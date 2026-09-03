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
import { formatCurrency } from "@/lib/utils";

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

export function EarningsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card-surface p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white">الأرباح الشهرية</h3>
        <div className="mt-4 h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={48} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#22d3ee", strokeOpacity: 0.2 }} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#earnGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold text-white">الإحالات الشهرية</h3>
        <div className="mt-4 h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={32} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37,99,235,0.12)" }} />
              <Bar dataKey="referrals" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
