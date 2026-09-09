"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { UTCTimestamp } from "lightweight-charts";
import { animate, useMotionValue } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Point = { time: UTCTimestamp; value: number };

const INSTRUMENTS = [
  { sym: "XAU/USD", label: "الذهب (XAU/USD)", refVol: 0.15 },
  { sym: "EUR/USD", label: "EUR/USD", refVol: 0.08 },
  { sym: "GBP/USD", label: "GBP/USD", refVol: 0.09 },
  { sym: "BTC/USD", label: "BTC/USD", refVol: 0.6 },
];

const YEARS = [2021, 2022, 2023, 2024];
const LOTS_PER_CLIENT = [5, 10, 20];
const TIERS = [
  { key: "tierStandard", perLot: 6 },
  { key: "tierGold", perLot: 8 },
  { key: "tierVip", perLot: 10 },
] as const;

function synthetic(base: number): Point[] {
  const start = Math.floor(Date.UTC(2024, 0, 1) / 1000);
  const pts: Point[] = [];
  let v = base;
  for (let i = 0; i < 250; i++) {
    v *= 1 + (Math.random() - 0.5) * 0.02;
    pts.push({ time: (start + i * 86400) as UTCTimestamp, value: +v.toFixed(2) });
  }
  return pts;
}

function annualizedVol(series: Point[]): number {
  const rets: number[] = [];
  for (let i = 1; i < series.length; i++) {
    rets.push(series[i].value / series[i - 1].value - 1);
  }
  if (!rets.length) return 0;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varc =
    rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  return Math.sqrt(varc) * Math.sqrt(252);
}

function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{format(display)}</>;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function Backtest() {
  const t = useTranslations("Backtest");
  const tc = useTranslations("Calculator");

  const [instIdx, setInstIdx] = useState(0);
  const [year, setYear] = useState(2024);
  const [clients, setClients] = useState(50);
  const [lotsPer, setLotsPer] = useState(10);
  const [tierIdx, setTierIdx] = useState(1);

  const [series, setSeries] = useState<Point[]>([]);
  const [real, setReal] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inst = INSTRUMENTS[instIdx];

  // Fetch historical series on instrument/year change.
  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(
          `/api/backtest?symbol=${encodeURIComponent(inst.sym)}&year=${year}`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (!active) return;
        if (j?.ok && Array.isArray(j.series) && j.series.length > 5) {
          setSeries(
            j.series.map((p: { time: number; value: number }) => ({
              time: p.time as UTCTimestamp,
              value: p.value,
            }))
          );
          setReal(true);
        } else {
          setSeries(synthetic(inst.refVol * 1000 + 100));
          setReal(false);
        }
      } catch {
        if (active) {
          setSeries(synthetic(100));
          setReal(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [inst.sym, inst.refVol, year]);

  // Render the historical chart.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !series.length) return;
    let disposed = false;
    let cleanup = () => {};
    import("lightweight-charts").then(({ createChart, ColorType }) => {
      if (disposed || !container) return;
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#94a3b8",
          fontFamily: "inherit",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.04)" },
          horzLines: { color: "rgba(255,255,255,0.04)" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
        timeScale: { borderColor: "rgba(255,255,255,0.06)" },
        autoSize: true,
        handleScroll: false,
        handleScale: false,
      });
      const area = chart.addAreaSeries({
        lineColor: "#00D1E6",
        topColor: "rgba(34,211,238,0.35)",
        bottomColor: "rgba(34,211,238,0)",
        lineWidth: 2,
        priceLineVisible: false,
      });
      area.setData(series);
      chart.timeScale().fitContent();
      cleanup = () => chart.remove();
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [series]);

  const { total, monthly, ret, vol } = useMemo(() => {
    if (!series.length) return { total: 0, monthly: 0, ret: 0, vol: 0 };
    const first = series[0].value;
    const last = series[series.length - 1].value;
    const ret = ((last - first) / first) * 100;
    const vol = annualizedVol(series);
    const activity = Math.min(1.8, Math.max(0.6, vol / inst.refVol));
    const totalLots = clients * lotsPer * 12 * activity;
    const total = totalLots * TIERS[tierIdx].perLot;
    return { total, monthly: total / 12, ret, vol: vol * 100 };
  }, [series, clients, lotsPer, tierIdx, inst.refVol]);

  return (
    <section id="backtest" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
            {t("badge")}
          </span>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-slate-400">{t("subheading")}</p>
        </div>

        <div className="card-surface mt-12 grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  {t("instrumentLabel")}
                </span>
                <select
                  value={instIdx}
                  onChange={(e) => setInstIdx(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
                >
                  {INSTRUMENTS.map((it, i) => (
                    <option key={it.sym} value={i}>
                      {it.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  {t("yearLabel")}
                </span>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-slate-300">{t("clientsLabel")}</label>
                <span
                  dir="ltr"
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-sm font-bold text-brand-300 tabular-nums"
                >
                  {clients}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                value={clients}
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  {t("lotsPerClientLabel")}
                </span>
                <select
                  value={lotsPer}
                  onChange={(e) => setLotsPer(Number(e.target.value))}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
                >
                  {LOTS_PER_CLIENT.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="mb-2 block text-sm text-slate-300">
                  {tc("tierLabel")}
                </span>
                <div className="flex gap-1.5">
                  {TIERS.map((tier, i) => (
                    <button
                      key={tier.key}
                      onClick={() => setTierIdx(i)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition",
                        i === tierIdx
                          ? "border-brand-500/40 bg-brand-500/15 text-brand-200"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {tc(tier.key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Historical chart */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-300">{inst.label}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    real
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/5 text-slate-500"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      real ? "bg-emerald-400" : "bg-slate-500"
                    )}
                  />
                  {real ? t("realData") : t("demoData")}
                </span>
              </div>
              <div
                ref={containerRef}
                className={cn("h-40 w-full", loading && "animate-pulse")}
              />
            </div>
          </div>

          {/* Result */}
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-white/5 p-8">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative text-center">
              <div className="text-sm text-slate-400">
                {t("totalLabel")} — <span dir="ltr">{year}</span>
              </div>
              <div dir="ltr" className="mt-2 text-4xl font-extrabold text-gradient sm:text-5xl">
                <AnimatedNumber value={total} format={(n) => usd.format(n)} />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-6">
                <Stat label={t("monthlyLabel")}>
                  <span dir="ltr">
                    <AnimatedNumber value={monthly} format={(n) => usd.format(n)} />
                  </span>
                </Stat>
                <Stat label={t("returnLabel")}>
                  <span dir="ltr" className={ret >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {ret >= 0 ? "+" : ""}
                    {ret.toFixed(1)}%
                  </span>
                </Stat>
                <Stat label={t("volLabel")}>
                  <span dir="ltr">{vol.toFixed(0)}%</span>
                </Stat>
              </div>

              <div className="mt-8">
                <Button href="/login" className="w-full">
                  {tc("cta")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">{t("note")}</p>
      </Container>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-white tabular-nums">{children}</div>
    </div>
  );
}
