import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "lucide-react";

type Market = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  /** Tailwind classes for the instrument medallion. */
  tone: string;
  glyph: string;
  spark: number[];
};

// Representative quotes for the hero ticker (illustrative, not live).
const MARKETS: Market[] = [
  {
    symbol: "EURUSD",
    name: "يورو / دولار",
    price: "1.0823",
    change: "+0.36%",
    tone: "bg-blue-500/15 text-blue-300 ring-blue-400/25",
    glyph: "€",
    spark: [6, 5, 6, 7, 6, 8, 7, 9, 8, 10],
  },
  {
    symbol: "XAUUSD",
    name: "الذهب / دولار",
    price: "2,643.52",
    change: "+0.82%",
    tone: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
    glyph: "Au",
    spark: [4, 6, 5, 7, 8, 7, 9, 10, 9, 12],
  },
  {
    symbol: "USOIL",
    name: "نفط خام WTI",
    price: "76.31",
    change: "+0.58%",
    tone: "bg-slate-400/15 text-slate-200 ring-slate-300/25",
    glyph: "◍",
    spark: [7, 6, 7, 6, 8, 7, 8, 7, 9, 9],
  },
  {
    symbol: "BTCUSD",
    name: "بيتكوين / دولار",
    price: "67,432.10",
    change: "+1.24%",
    tone: "bg-orange-500/15 text-orange-300 ring-orange-400/25",
    glyph: "₿",
    spark: [5, 7, 6, 8, 7, 9, 8, 10, 11, 13],
  },
];

/** Rising mini chart with a soft gradient fill under the line. */
function Spark({ values, id }: { values: number[]; id: string }) {
  const w = 56;
  const h = 32;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pt = (v: number, i: number) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 6) - 3;
    return [x, y] as const;
  };
  const line = values.map((v, i) => pt(v, i).map((n) => n.toFixed(1)).join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-14 shrink-0" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Live-price bar pinned under the hero: four glassmorphism instrument cards
 * plus a "view all markets" action.
 */
export function HeroTicker({ viewAllLabel }: { viewAllLabel: string }) {
  return (
    <div className="relative border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      <Container className="py-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-5">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MARKETS.map((m) => (
              <li
                key={m.symbol}
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 ${m.tone}`}
                  aria-hidden
                >
                  {m.glyph}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="whitespace-nowrap text-sm font-bold leading-tight text-white">
                    {m.symbol}
                  </div>
                  <div className="truncate text-[11px] leading-tight text-slate-400">
                    {m.name}
                  </div>
                  <div className="mt-1 flex flex-nowrap items-baseline gap-1.5" dir="ltr">
                    <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-white">
                      {m.price}
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-emerald-400">
                      ▲ {m.change}
                    </span>
                  </div>
                </div>

                <Spark values={m.spark} id={`spark-${m.symbol}`} />
              </li>
            ))}
          </ul>

          <Link
            href="/compare"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            {viewAllLabel}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
