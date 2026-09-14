import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "lucide-react";

type Market = {
  symbol: string;
  /** Key in the `Ticker` message namespace. */
  name: string;
  /** Tailwind classes for the instrument medallion. */
  tone: string;
  glyph: string;
  spark: number[];
};

/**
 * The instruments the network's brokers cover.
 *
 * This strip used to carry a price and a percentage for each — "1.0823
 * +0.36%", "2,643.52 +0.82%" — with a comment calling them illustrative. A
 * comment in the source is not a disclosure: on the page they were
 * indistinguishable from live quotes, on a site about brokers, every one of
 * them invented and every one of them green.
 *
 * Wiring the strip to real prices would mean a third-party call on the
 * highest-traffic page, behind an API key, for decoration. So the numbers are
 * gone instead and what remains is what is true: these are the instruments you
 * can trade through the network. The sparkline stays as ornament — it carries
 * no axis, no scale and no claim.
 */
const MARKETS: Market[] = [
  {
    symbol: "EURUSD",
    name: "eurusd",
    tone: "bg-blue-500/15 text-blue-300 ring-blue-400/25",
    glyph: "€",
    spark: [6, 5, 6, 7, 6, 8, 7, 9, 8, 10],
  },
  {
    symbol: "XAUUSD",
    name: "xauusd",
    tone: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
    glyph: "Au",
    spark: [4, 6, 5, 7, 8, 7, 9, 10, 9, 12],
  },
  {
    symbol: "USOIL",
    name: "wti",
    tone: "bg-slate-400/15 text-slate-200 ring-slate-300/25",
    glyph: "◍",
    spark: [7, 6, 7, 6, 8, 7, 8, 7, 9, 9],
  },
  {
    symbol: "BTCUSD",
    name: "btcusd",
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
  const t = useTranslations("Ticker");
  return (
    <div className="relative border-t border-fg/[0.06] bg-fg/[0.02] backdrop-blur-sm">
      <Container className="py-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-5">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MARKETS.map((m) => (
              <li
                key={m.symbol}
                className="flex items-center gap-2.5 rounded-2xl border border-fg/10 bg-fg/[0.04] px-3.5 py-3 backdrop-blur-md transition hover:border-fg/20 hover:bg-fg/[0.07]"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 ${m.tone}`}
                  aria-hidden
                >
                  {m.glyph}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="whitespace-nowrap text-sm font-bold leading-tight text-fg">
                    {m.symbol}
                  </div>
                  <div className="truncate text-xs sm:text-[11px] leading-tight text-slate-400">
                    {t(m.name)}
                  </div>
                  <div className="mt-1 truncate text-xs sm:text-[11px] leading-tight text-slate-500">
                    {t("tradedVia")}
                  </div>
                </div>

                <Spark values={m.spark} id={`spark-${m.symbol}`} />
              </li>
            ))}
          </ul>

          <Link
            href="/compare"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fg/10 bg-fg/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-fg/20 hover:bg-fg/[0.08] hover:text-fg"
          >
            {viewAllLabel}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
