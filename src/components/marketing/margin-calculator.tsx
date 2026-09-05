"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { Gauge, ArrowLeft, Sparkles } from "lucide-react";

// Instrument → contract size + a sensible default price (editable by the user).
const INSTRUMENTS = [
  { sym: "EUR/USD", contract: 100000, price: 1.08 },
  { sym: "GBP/USD", contract: 100000, price: 1.27 },
  { sym: "USD/JPY", contract: 100000, price: 1.0 },
  { sym: "XAU/USD (ذهب)", contract: 100, price: 2640 },
  { sym: "US30 (مؤشر)", contract: 1, price: 42000 },
  { sym: "BTC/USD", contract: 1, price: 67000 },
];

type Broker = {
  id: string;
  name: string;
  slug: string;
  leverage_max: string | null;
  welcome_bonus: string | null;
  broker_links: { code: string | null; referral_url: string }[] | null;
};

// Fallback brokers so the tool is useful before Supabase is wired.
const FALLBACK: Broker[] = [
  { id: "f1", name: "Alpha Markets", slug: "alpha-markets", leverage_max: "1:2000", welcome_bonus: "$50", broker_links: null },
  { id: "f2", name: "Titan FX", slug: "titan-fx", leverage_max: "1:500", welcome_bonus: null, broker_links: null },
  { id: "f3", name: "Nova Trade", slug: "nova-trade", leverage_max: "1:1000", welcome_bonus: "$25", broker_links: null },
];

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
    isFinite(n) ? n : 0
  );

function parseLeverage(s: string | null): number {
  if (!s) return 100;
  const m = s.match(/1\s*:\s*(\d+)/);
  return m ? Number(m[1]) : Number(s.replace(/\D/g, "")) || 100;
}

function brokerHref(b: Broker): string {
  const link = b.broker_links?.[0];
  if (link?.code) return `/go/${link.code}`;
  if (link?.referral_url) return link.referral_url;
  return `/brokers/${b.slug}`;
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white focus:border-brand-500/50 focus:outline-none";

export function MarginCalculator() {
  const [brokers, setBrokers] = useState<Broker[]>(FALLBACK);
  const [brokerId, setBrokerId] = useState<string>(FALLBACK[0].id);
  const [instIdx, setInstIdx] = useState(0);
  const [lots, setLots] = useState(1);
  const [price, setPrice] = useState(INSTRUMENTS[0].price);

  // Pull real brokers (with leverage + tracked links) when Supabase is set.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("brokers")
          .select("id,name,slug,leverage_max,welcome_bonus,broker_links(code,referral_url)")
          .eq("is_published", true)
          .order("sort_order");
        if (data && data.length) {
          setBrokers(data as Broker[]);
          setBrokerId((data as Broker[])[0].id);
        }
      } catch {
        /* keep fallback */
      }
    })();
  }, []);

  const broker = brokers.find((b) => b.id === brokerId) ?? brokers[0];
  const inst = INSTRUMENTS[instIdx];
  const leverage = parseLeverage(broker?.leverage_max ?? null);

  // Best available leverage across brokers (for the smart hint / CTA).
  const bestBroker = useMemo(
    () =>
      brokers.reduce(
        (best, b) => (parseLeverage(b.leverage_max) > parseLeverage(best.leverage_max) ? b : best),
        brokers[0]
      ),
    [brokers]
  );

  const notional = lots * inst.contract * price;
  const margin = notional / leverage;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
          <Gauge className="h-3.5 w-3.5" aria-hidden />
          المارجن والرافعة
        </span>
        <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
          احسب الهامش المطلوب لكل شركة
        </h2>
        <p className="mt-4 text-slate-400">
          اختر الشركة والأداة وحجم الصفقة — نحسب لك الهامش المحجوز فوراً حسب رافعة كل شركة.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Inputs */}
        <div className="card-surface space-y-5 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">شركة التداول</span>
            <select
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
              className={inputCls}
            >
              {brokers.map((b) => (
                <option key={b.id} value={b.id} className="bg-ink-900">
                  {b.name} — {b.leverage_max || "1:100"}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-300">الأداة</span>
              <select
                value={instIdx}
                onChange={(e) => {
                  const i = Number(e.target.value);
                  setInstIdx(i);
                  setPrice(INSTRUMENTS[i].price);
                }}
                className={inputCls}
              >
                {INSTRUMENTS.map((it, i) => (
                  <option key={it.sym} value={i} className="bg-ink-900">
                    {it.sym}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-300">حجم الصفقة (لوت)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={lots}
                onChange={(e) => setLots(Number(e.target.value))}
                className={inputCls}
                dir="ltr"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">سعر الأداة الحالي</span>
            <input
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputCls}
              dir="ltr"
            />
          </label>
        </div>

        {/* Result */}
        <div className="card-surface relative overflow-hidden p-6">
          <div className="hero-glow absolute inset-0 opacity-50" />
          <div className="relative">
            <div className="text-sm text-slate-400">الهامش المطلوب (تقديري)</div>
            <div dir="ltr" className="mt-1 text-4xl font-extrabold text-gradient">
              {usd(margin)}
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <dt className="text-slate-400">الرافعة المستخدمة</dt>
                <dd dir="ltr" className="font-semibold text-white">1:{leverage}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <dt className="text-slate-400">القيمة الاسمية</dt>
                <dd dir="ltr" className="font-semibold text-white">{usd(notional)}</dd>
              </div>
            </dl>

            {/* Smart CTA */}
            {bestBroker && (
              <div className="mt-6 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-200">
                  <Sparkles className="h-4 w-4" />
                  أفضل رافعة متاحة
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {bestBroker.name} يمنحك رافعة {bestBroker.leverage_max}
                  {bestBroker.welcome_bonus ? ` وبونص ترحيبي ${bestBroker.welcome_bonus}` : ""} — هامش أقل وقوة شرائية أكبر.
                </p>
                <Link
                  href={brokerHref(bestBroker)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  افتح الحساب الآن
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-600">
        الهامش تقديري بناءً على القيمة الاسمية ورافعة الشركة؛ قد تختلف القيم الفعلية حسب زوج العملة وعملة الحساب.
      </p>
    </div>
  );
}
