"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { Calculator, Scale, LineChart, ShieldAlert, Loader2 } from "lucide-react";

// Code-split the heavy interactive tools: only the active tab's JS is fetched,
// keeping the homepage/tools initial bundle light.
const toolLoading = () => (
  <div className="grid place-items-center py-24">
    <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
  </div>
);
const ProfitCalculator = dynamic(
  () => import("@/components/marketing/profit-calculator").then((m) => m.ProfitCalculator),
  { ssr: false, loading: toolLoading }
);
const RiskCalculator = dynamic(
  () => import("@/components/marketing/risk-calculator").then((m) => m.RiskCalculator),
  { ssr: false, loading: toolLoading }
);
const BrokerComparison = dynamic(
  () => import("@/components/marketing/broker-comparison").then((m) => m.BrokerComparison),
  { ssr: false, loading: toolLoading }
);
const Backtest = dynamic(
  () => import("@/components/marketing/backtest").then((m) => m.Backtest),
  { ssr: false, loading: toolLoading }
);

const TABS = [
  { key: "calc", label: "حاسبة الأرباح", icon: Calculator },
  { key: "risk", label: "المخاطرة والنقطة", icon: ShieldAlert },
  { key: "compare", label: "قارن عمولتك", icon: Scale },
  { key: "backtest", label: "محاكي الأداء", icon: LineChart },
] as const;

export function ToolsTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("calc");

  return (
    <section
      id="tools"
      className="border-y border-white/5 bg-ink-900/30"
    >
      <Container className="pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
          أدوات الشركاء
        </span>
        <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
          كل ما تحتاجه لاتخاذ القرار
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          حاسبات وأدوات تفاعلية في مكان واحد — اختر الأداة التي تناسبك.
        </p>

        {/* Tab bar */}
        <div className="mt-8 inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-ink-900/50 p-1.5">
          {TABS.map((tb) => {
            const on = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  on
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <tb.icon className="h-4 w-4" />
                {tb.label}
              </button>
            );
          })}
        </div>
      </Container>

      {/* Active tool (each brings its own layout) */}
      <div className="-mt-4">
        {tab === "calc" && <ProfitCalculator />}
        {tab === "risk" && <RiskCalculator />}
        {tab === "compare" && <BrokerComparison />}
        {tab === "backtest" && <Backtest />}
      </div>
    </section>
  );
}
