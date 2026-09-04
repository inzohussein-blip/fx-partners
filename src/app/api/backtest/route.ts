import { NextResponse } from "next/server";

// Historical daily closes for the backtest simulator. Free sources, no key:
// crypto → Binance klines; gold/forex → Stooq daily CSV. Proxied so the
// browser never hits CORS-restricted endpoints.

const SOURCES: Record<string, { kind: "binance" | "stooq"; sym: string }> = {
  "BTC/USD": { kind: "binance", sym: "BTCUSDT" },
  "XAU/USD": { kind: "stooq", sym: "xauusd" },
  "EUR/USD": { kind: "stooq", sym: "eurusd" },
  "GBP/USD": { kind: "stooq", sym: "gbpusd" },
};

type Point = { time: number; value: number };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "";
  const year = Number(searchParams.get("year"));

  const src = SOURCES[symbol];
  if (!src) return NextResponse.json({ ok: false, reason: "bad-symbol" }, { status: 400 });
  if (!year || year < 2015 || year > new Date().getFullYear()) {
    return NextResponse.json({ ok: false, reason: "bad-year" }, { status: 400 });
  }

  try {
    let series: Point[] = [];

    if (src.kind === "binance") {
      const start = Date.UTC(year, 0, 1);
      const end = Date.UTC(year, 11, 31, 23, 59);
      const url = `https://api.binance.com/api/v3/klines?symbol=${src.sym}&interval=1d&startTime=${start}&endTime=${end}&limit=400`;
      const r = await fetch(url, { next: { revalidate: 86400 } });
      const arr = await r.json();
      if (Array.isArray(arr)) {
        series = arr.map((k: [number, string, string, string, string]) => ({
          time: Math.floor(k[0] / 1000),
          value: parseFloat(k[4]),
        }));
      }
    } else {
      const d1 = `${year}0101`;
      const d2 = `${year}1231`;
      const url = `https://stooq.com/q/d/l/?s=${src.sym}&d1=${d1}&d2=${d2}&i=d`;
      const r = await fetch(url, { next: { revalidate: 86400 } });
      const csv = await r.text();
      // CSV: Date,Open,High,Low,Close,Volume
      const rows = csv.trim().split("\n").slice(1);
      series = rows
        .map((line) => {
          const cols = line.split(",");
          const close = parseFloat(cols[4]);
          const t = Math.floor(new Date(cols[0]).getTime() / 1000);
          return { time: t, value: close };
        })
        .filter((p) => Number.isFinite(p.value) && Number.isFinite(p.time));
    }

    if (series.length < 5) {
      return NextResponse.json({ ok: false, reason: "no-data" });
    }

    return NextResponse.json({
      ok: true,
      series,
      first: series[0].value,
      last: series[series.length - 1].value,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      reason: err instanceof Error ? err.message : "fetch-failed",
    });
  }
}
