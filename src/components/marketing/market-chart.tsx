"use client";

import { useEffect, useRef, useState } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

type Symbol = {
  id: string;
  label: string;
  base: number;
  vol: number;
  digits: number;
};

const SYMBOLS: Symbol[] = [
  { id: "EURUSD", label: "EUR/USD", base: 1.085, vol: 0.0006, digits: 4 },
  { id: "XAUUSD", label: "XAU/USD", base: 2350, vol: 1.6, digits: 2 },
  { id: "GBPUSD", label: "GBP/USD", base: 1.27, vol: 0.0007, digits: 4 },
  { id: "BTCUSD", label: "BTC/USD", base: 68000, vol: 45, digits: 1 },
];

type Point = { time: UTCTimestamp; value: number };

/** Simulated fallback series (used when the live feed is unavailable). */
function seed(sym: Symbol): Point[] {
  const now = Math.floor(Date.now() / 1000);
  const pts: Point[] = [];
  let v = sym.base;
  for (let i = 120; i > 0; i--) {
    v += (Math.random() - 0.5) * sym.vol * 2;
    pts.push({ time: (now - i * 60) as UTCTimestamp, value: +v.toFixed(sym.digits) });
  }
  return pts;
}

async function loadSeries(sym: Symbol): Promise<{ points: Point[]; real: boolean }> {
  try {
    const r = await fetch(
      `/api/markets?symbol=${encodeURIComponent(sym.label)}&type=series`,
      { cache: "no-store" }
    );
    const j = await r.json();
    if (j?.ok && Array.isArray(j.series) && j.series.length) {
      return {
        points: j.series.map((p: { time: number; value: number }) => ({
          time: p.time as UTCTimestamp,
          value: p.value,
        })),
        real: true,
      };
    }
  } catch {
    /* fall through */
  }
  return { points: seed(sym), real: false };
}

async function loadPrice(sym: Symbol): Promise<number | null> {
  try {
    const r = await fetch(
      `/api/markets?symbol=${encodeURIComponent(sym.label)}&type=price`,
      { cache: "no-store" }
    );
    const j = await r.json();
    if (j?.ok && typeof j.price === "number") return j.price;
  } catch {
    /* ignore */
  }
  return null;
}

export function MarketChart() {
  const [symIdx, setSymIdx] = useState(0);
  const sym = SYMBOLS[symIdx];
  const containerRef = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState(0);
  const [source, setSource] = useState<"live" | "demo" | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const current = SYMBOLS[symIdx];

    let disposed = false;
    let cleanup = () => {};

    import("lightweight-charts").then(async ({ createChart, ColorType }) => {
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
        timeScale: {
          borderColor: "rgba(255,255,255,0.06)",
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          vertLine: { color: "#22d3ee", labelBackgroundColor: "#0891b2" },
          horzLine: { color: "#22d3ee", labelBackgroundColor: "#0891b2" },
        },
        autoSize: true,
        handleScroll: false,
        handleScale: false,
      });

      const series = chart.addAreaSeries({
        lineColor: "#22d3ee",
        topColor: "rgba(34,211,238,0.35)",
        bottomColor: "rgba(34,211,238,0)",
        lineWidth: 2,
        priceLineVisible: false,
        priceFormat: {
          type: "price",
          precision: current.digits,
          minMove: Math.pow(10, -current.digits),
        },
      });

      const { points, real } = await loadSeries(current);
      if (disposed) {
        chart.remove();
        return;
      }
      series.setData(points);
      chart.timeScale().fitContent();
      setSource(real ? "live" : "demo");

      const first = points[0].value;
      let last = points[points.length - 1];
      setPrice(last.value);
      setChange(((last.value - first) / first) * 100);

      const tick = async () => {
        const now = Math.floor(Date.now() / 1000);
        let nv: number;
        if (real) {
          const p = await loadPrice(current);
          if (p == null || disposed) return;
          nv = +p.toFixed(current.digits);
        } else {
          nv = +(last.value + (Math.random() - 0.5) * current.vol * 2).toFixed(
            current.digits
          );
        }
        last = { time: Math.max(now, last.time) as UTCTimestamp, value: nv };
        series.update(last);
        setPrice(nv);
        setChange(((nv - first) / first) * 100);
      };

      // Real prices poll every 10s (free-tier friendly); demo ticks every 1s.
      const iv = setInterval(tick, real ? 10000 : 1000);

      cleanup = () => {
        clearInterval(iv);
        chart.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [symIdx]);

  const up = change >= 0;

  return (
    <div className="card-surface p-5">
      {/* Symbol tabs */}
      <div className="flex flex-wrap gap-1.5">
        {SYMBOLS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSymIdx(i)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              i === symIdx
                ? "bg-brand-500/15 text-brand-200"
                : "bg-white/5 text-slate-400 hover:text-white"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Price header */}
      <div className="mt-4 flex items-end justify-between" dir="ltr">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {sym.label}
            {source && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                  source === "live"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/5 text-slate-500"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    source === "live" ? "bg-emerald-400" : "bg-slate-500"
                  )}
                />
                {source === "live" ? "LIVE" : "DEMO"}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {price !== null ? price.toFixed(sym.digits) : "—"}
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums",
            up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}
        >
          {up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {up ? "+" : ""}
          {change.toFixed(2)}%
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="mt-4 h-[300px] w-full sm:h-[340px]" />
    </div>
  );
}
