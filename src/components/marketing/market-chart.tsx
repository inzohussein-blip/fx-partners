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

export function MarketChart() {
  const [symIdx, setSymIdx] = useState(0);
  const sym = SYMBOLS[symIdx];
  const containerRef = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const current = SYMBOLS[symIdx];

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

      const data = seed(current);
      series.setData(data);
      chart.timeScale().fitContent();

      const first = data[0].value;
      let last = data[data.length - 1];
      setPrice(last.value);
      setChange(((last.value - first) / first) * 100);

      const iv = setInterval(() => {
        const t = Math.max(
          Math.floor(Date.now() / 1000),
          last.time
        ) as UTCTimestamp;
        const nv = +(last.value + (Math.random() - 0.5) * current.vol * 2).toFixed(
          current.digits
        );
        last = { time: t, value: nv };
        series.update(last);
        setPrice(nv);
        setChange(((nv - first) / first) * 100);
      }, 1000);

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
          <div className="text-sm text-slate-400">{sym.label}</div>
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
