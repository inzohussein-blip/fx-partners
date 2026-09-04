"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as Slider from "@radix-ui/react-slider";
import { animate, useMotionValue } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// USD-based fallback rates (used until the live feed loads / if it fails).
const FALLBACK: Record<string, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.79,
  sar: 3.75,
  aed: 3.67,
  egp: 48,
  try: 32,
};

const CURRENCIES = [
  { code: "usd", label: "USD $" },
  { code: "eur", label: "EUR €" },
  { code: "gbp", label: "GBP £" },
  { code: "sar", label: "SAR ﷼" },
  { code: "aed", label: "AED د.إ" },
  { code: "egp", label: "EGP £" },
  { code: "try", label: "TRY ₺" },
];

const TIERS = [
  { key: "tierStandard", perLot: 6 },
  { key: "tierGold", perLot: 8 },
  { key: "tierVip", perLot: 10 },
] as const;

// Representative contract size + price per standard lot (illustrative).
const INSTRUMENTS = [
  { sym: "EUR/USD", contract: 100000, price: 1.085 },
  { sym: "XAU/USD", contract: 100, price: 2350 },
  { sym: "GBP/USD", contract: 100000, price: 1.27 },
  { sym: "BTC/USD", contract: 1, price: 68000 },
];

const LEVERAGES = [50, 100, 200, 500, 1000, 2000];

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

export function ProfitCalculator() {
  const t = useTranslations("Calculator");
  const [lots, setLots] = useState(150);
  const [tierIdx, setTierIdx] = useState(1);
  const [instIdx, setInstIdx] = useState(0);
  const [leverage, setLeverage] = useState(500);
  const [currency, setCurrency] = useState("usd");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK);

  useEffect(() => {
    let active = true;
    const urls = [
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
    ];
    (async () => {
      for (const u of urls) {
        try {
          const r = await fetch(u);
          if (!r.ok) continue;
          const j = await r.json();
          if (active && j?.usd) {
            setRates(j.usd);
            return;
          }
        } catch {
          /* try next */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const perLot = TIERS[tierIdx].perLot;
  const inst = INSTRUMENTS[instIdx];
  const rate = currency === "usd" ? 1 : rates[currency] ?? FALLBACK[currency] ?? 1;

  const monthly = lots * perLot * rate;
  const yearly = monthly * 12;
  const notional = lots * inst.contract * inst.price * rate;
  const margin = notional / leverage;

  const fmt = useMemo(() => {
    const nf = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    });
    return (n: number) => nf.format(n);
  }, [currency]);

  return (
    <section id="calculator" className="py-20">
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
            {/* Tier */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                {t("tierLabel")}
              </label>
              <div className="flex gap-2">
                {TIERS.map((tier, i) => (
                  <button
                    key={tier.key}
                    onClick={() => setTierIdx(i)}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                      i === tierIdx
                        ? "border-brand-500/40 bg-brand-500/15 text-brand-200"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    )}
                  >
                    <div>{t(tier.key)}</div>
                    <div dir="ltr" className="text-xs font-normal text-slate-500">
                      ${tier.perLot} {t("perLot")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument + leverage */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  {t("instrumentLabel")}
                </span>
                <select
                  value={instIdx}
                  onChange={(e) => setInstIdx(Number(e.target.value))}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
                >
                  {INSTRUMENTS.map((it, i) => (
                    <option key={it.sym} value={i}>
                      {it.sym}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  {t("leverageLabel")}
                </span>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none"
                >
                  {LEVERAGES.map((l) => (
                    <option key={l} value={l}>
                      1:{l}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Lots slider */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm text-slate-300">{t("lotsLabel")}</label>
                <span
                  dir="ltr"
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-sm font-bold text-brand-300 tabular-nums"
                >
                  {lots.toLocaleString("en-US")} {t("lot")}
                </span>
              </div>
              <Slider.Root
                className="relative flex h-5 w-full touch-none select-none items-center"
                value={[lots]}
                onValueChange={([v]) => setLots(v)}
                min={1}
                max={1000}
                step={1}
              >
                <Slider.Track className="relative h-1.5 grow rounded-full bg-white/10">
                  <Slider.Range className="absolute h-full rounded-full bg-brand-gradient" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label={t("lotsLabel")}
                  className="block h-5 w-5 rounded-full border-2 border-brand-400 bg-white shadow-glow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                />
              </Slider.Root>
              <div dir="ltr" className="mt-2 flex justify-between text-xs text-slate-600">
                <span>1</span>
                <span>1000</span>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                {t("currencyLabel")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white focus:border-brand-500/50 focus:outline-none sm:w-48"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-white/5 p-8">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative text-center">
              <div className="text-sm text-slate-400">{t("monthlyLabel")}</div>
              <div
                dir="ltr"
                className="mt-2 text-4xl font-extrabold text-gradient sm:text-5xl"
              >
                <AnimatedNumber value={monthly} format={fmt} />
              </div>

              <div className="mt-5 border-t border-white/5 pt-5">
                <div className="text-sm text-slate-400">{t("yearlyLabel")}</div>
                <div dir="ltr" className="mt-1 text-2xl font-bold text-white">
                  <AnimatedNumber value={yearly} format={fmt} />
                </div>
              </div>

              {/* Trading details: notional + required margin */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
                <div className="rounded-xl bg-ink-900/40 p-3">
                  <div className="text-xs text-slate-500">{t("notionalLabel")}</div>
                  <div dir="ltr" className="mt-1 text-sm font-semibold text-white">
                    <AnimatedNumber value={notional} format={fmt} />
                  </div>
                </div>
                <div className="rounded-xl bg-ink-900/40 p-3">
                  <div className="text-xs text-slate-500">
                    {t("marginLabel")}{" "}
                    <span dir="ltr" className="text-brand-300">
                      1:{leverage}
                    </span>
                  </div>
                  <div dir="ltr" className="mt-1 text-sm font-semibold text-brand-300">
                    <AnimatedNumber value={margin} format={fmt} />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button href="/login" className="w-full">
                  {t("cta")}
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
