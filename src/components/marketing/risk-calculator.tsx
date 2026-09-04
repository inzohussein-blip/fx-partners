"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Calculator, Coins, ArrowLeft } from "lucide-react";

// Approximate pip value (USD) per standard lot, per instrument.
const INSTRUMENTS = [
  { sym: "EUR/USD", pip: 10 },
  { sym: "GBP/USD", pip: 10 },
  { sym: "AUD/USD", pip: 10 },
  { sym: "USD/JPY", pip: 6.7 },
  { sym: "USD/CHF", pip: 11 },
  { sym: "XAU/USD (ذهب)", pip: 10 },
];

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

export function RiskCalculator() {
  const [mode, setMode] = useState<"size" | "pip">("size");

  // Position size inputs
  const [balance, setBalance] = useState(5000);
  const [risk, setRisk] = useState(2);
  const [stop, setStop] = useState(30);
  const [instIdx, setInstIdx] = useState(0);

  // Pip value inputs
  const [lots, setLots] = useState(1);
  const [pipInstIdx, setPipInstIdx] = useState(0);

  const inst = INSTRUMENTS[instIdx];
  const pipInst = INSTRUMENTS[pipInstIdx];

  const size = useMemo(() => {
    const riskAmount = (balance * risk) / 100;
    const lotsOut = riskAmount / (stop * inst.pip);
    return { riskAmount, lots: lotsOut };
  }, [balance, risk, stop, inst]);

  const pipValue = useMemo(() => lots * pipInst.pip, [lots, pipInst]);

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white focus:border-brand-500/50 focus:outline-none";

  return (
    <section id="risk" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            حاسبة المخاطرة وقيمة النقطة
          </h2>
          <p className="mt-4 text-slate-400">
            احسب حجم صفقتك المناسب وقيمة النقطة قبل الدخول — إدارة المخاطر أولاً.
          </p>
        </div>

        {/* Mode switch */}
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-2 rounded-2xl border border-white/10 bg-ink-900/50 p-1.5">
          <button
            onClick={() => setMode("size")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              mode === "size" ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-white"
            )}
          >
            <Calculator className="h-4 w-4" /> حجم الصفقة
          </button>
          <button
            onClick={() => setMode("pip")}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              mode === "pip" ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-white"
            )}
          >
            <Coins className="h-4 w-4" /> قيمة النقطة
          </button>
        </div>

        <div className="card-surface mx-auto mt-8 grid max-w-3xl gap-8 p-6 sm:p-8 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            {mode === "size" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">رأس المال ($)</span>
                  <input type="number" dir="ltr" className={inputCls} value={balance}
                    onChange={(e) => setBalance(Number(e.target.value))} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">نسبة المخاطرة (%)</span>
                  <input type="number" step="0.1" dir="ltr" className={inputCls} value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">وقف الخسارة (نقاط)</span>
                  <input type="number" dir="ltr" className={inputCls} value={stop}
                    onChange={(e) => setStop(Number(e.target.value))} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">الأداة</span>
                  <select dir="ltr" className={inputCls} value={instIdx}
                    onChange={(e) => setInstIdx(Number(e.target.value))}>
                    {INSTRUMENTS.map((it, i) => (
                      <option key={it.sym} value={i}>{it.sym}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">عدد اللوتات</span>
                  <input type="number" step="0.01" dir="ltr" className={inputCls} value={lots}
                    onChange={(e) => setLots(Number(e.target.value))} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-300">الأداة</span>
                  <select dir="ltr" className={inputCls} value={pipInstIdx}
                    onChange={(e) => setPipInstIdx(Number(e.target.value))}>
                    {INSTRUMENTS.map((it, i) => (
                      <option key={it.sym} value={i}>{it.sym}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>

          {/* Result */}
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-white/5 p-8">
            <div className="hero-glow absolute inset-0 opacity-70" />
            <div className="relative text-center">
              {mode === "size" ? (
                <>
                  <div className="text-sm text-slate-400">حجم الصفقة الموصى به</div>
                  <div dir="ltr" className="mt-2 text-4xl font-extrabold text-gradient sm:text-5xl">
                    {(isFinite(size.lots) ? size.lots : 0).toFixed(2)} <span className="text-2xl">لوت</span>
                  </div>
                  <div className="mt-5 border-t border-white/5 pt-5 text-sm text-slate-400">
                    مبلغ المخاطرة
                    <div dir="ltr" className="mt-1 text-2xl font-bold text-white">
                      {usd(size.riskAmount)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-slate-400">قيمة النقطة التقريبية</div>
                  <div dir="ltr" className="mt-2 text-4xl font-extrabold text-gradient sm:text-5xl">
                    {usd(pipValue)}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">لكل نقطة على {pipInst.sym}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Affiliate CTA */}
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-brand-500/25 bg-brand-500/10 px-5 py-4">
          <p className="text-sm text-slate-200">
            لتداول هذا الحجم بأقل عمولة وسبريد ممكن، افتح حسابك عبر شركة موصى بها.
          </p>
          <Link
            href="/compare"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            أفضل الشركات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          القيم تقريبية لأغراض إدارة المخاطر، وقد تختلف حسب زوج العملة وسعر الصرف الحالي.
        </p>
      </Container>
    </section>
  );
}
