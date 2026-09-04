import { NextResponse } from "next/server";

// Proxy to Twelve Data so the API key never reaches the browser.
// Falls back (ok:false) when no key / on error, so the client can simulate.

const ALLOWED = new Set(["EUR/USD", "XAU/USD", "GBP/USD", "BTC/USD"]);

function toUnix(datetime: string): number {
  // Twelve Data returns "YYYY-MM-DD HH:MM:SS" in UTC.
  return Math.floor(new Date(datetime.replace(" ", "T") + "Z").getTime() / 1000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "";
  const type = searchParams.get("type") ?? "series";

  if (!ALLOWED.has(symbol)) {
    return NextResponse.json({ ok: false, reason: "bad-symbol" }, { status: 400 });
  }

  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, reason: "no-key" });
  }

  try {
    if (type === "price") {
      const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
        symbol
      )}&apikey=${key}`;
      const res = await fetch(url, { next: { revalidate: 8 } });
      const data = await res.json();
      const price = Number(data?.price);
      if (!Number.isFinite(price)) {
        return NextResponse.json({ ok: false, reason: data?.message ?? "no-price" });
      }
      return NextResponse.json({ ok: true, price });
    }

    // time series
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
      symbol
    )}&interval=1min&outputsize=120&apikey=${key}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    if (data?.status === "error" || !Array.isArray(data?.values)) {
      return NextResponse.json({ ok: false, reason: data?.message ?? "no-data" });
    }

    // Twelve Data returns newest-first; reverse to oldest-first for the chart.
    const series = data.values
      .map((v: { datetime: string; close: string }) => ({
        time: toUnix(v.datetime),
        value: Number(v.close),
      }))
      .filter((p: { value: number }) => Number.isFinite(p.value))
      .reverse();

    return NextResponse.json({ ok: true, series });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      reason: err instanceof Error ? err.message : "fetch-failed",
    });
  }
}
