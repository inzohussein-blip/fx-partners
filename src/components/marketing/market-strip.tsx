import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";

type Market = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  spark: number[];
};

// Representative quotes for the hero market strip (illustrative, not live).
const MARKETS: Market[] = [
  { symbol: "XAUUSD", name: "الذهب / دولار", price: "2,643.52", change: "+0.82%", spark: [4, 6, 5, 7, 8, 7, 9, 11] },
  { symbol: "EURUSD", name: "يورو / دولار", price: "1.0823", change: "+0.36%", spark: [6, 5, 6, 7, 6, 8, 7, 9] },
  { symbol: "BTCUSD", name: "بيتكوين / دولار", price: "67,432.10", change: "+1.24%", spark: [5, 7, 6, 8, 7, 9, 10, 12] },
  { symbol: "USOIL", name: "نفط خام WTI", price: "76.31", change: "+0.58%", spark: [7, 6, 7, 6, 8, 7, 8, 9] },
];

function Spark({ values }: { values: number[] }) {
  const w = 72;
  const h = 30;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-[72px]" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Premium market strip beneath the hero — four instruments with mini charts. */
export function MarketStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-ink-900/50">
      <Container className="py-6">
        <div className="grid items-center gap-x-8 gap-y-5 lg:grid-cols-[1fr_auto]">
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {MARKETS.map((m) => (
              <li key={m.symbol} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-white">{m.symbol}</span>
                    <span className="truncate text-[11px] text-slate-500">{m.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2" dir="ltr">
                    <span className="text-sm font-semibold text-white">{m.price}</span>
                    <span className="text-xs font-medium text-emerald-400">▲ {m.change}</span>
                  </div>
                </div>
                <div className="ms-auto">
                  <Spark values={m.spark} />
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/compare"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            كل الأسواق
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
