import { LogoMark } from "@/components/logo";
import { Users, Share2, Building2, ShieldCheck, ChevronDown } from "lucide-react";

function SourceNode({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Users;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="glass-card flex items-center gap-3 px-3.5 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="text-[11px] leading-tight text-slate-400">{subtitle}</div>
      </div>
    </div>
  );
}

/** A vertical animated connector between two stages of the diagram. */
function Flow() {
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <div className="relative flex flex-col items-center">
        <div className="flow-line-y h-9 w-0.5" />
        <ChevronDown className="-mt-1 h-3.5 w-3.5 text-brand-400/70" />
      </div>
    </div>
  );
}

/**
 * The identity visual: FX Partners sits BETWEEN traders / IB agents and a
 * network of licensed brokers. This is the one picture that says
 * "we are the intermediary (master IB)" rather than "we are a broker".
 *
 * Reads top-to-bottom at every width, so it needs no layout switch.
 */
export function ConnectionDiagram({
  brokers,
}: {
  /** Real partner brokers (name + optional logo). Falls back to generic
     network tiles when the directory is empty. */
  brokers?: { name: string; logo_url?: string | null }[];
}) {
  const tiles = (brokers && brokers.length > 0
    ? brokers.slice(0, 5).map((b) => ({ name: b.name, logo: b.logo_url ?? null }))
    : [
        { name: "شركة تداول", logo: null },
        { name: "شركة تداول", logo: null },
        { name: "شركة تداول", logo: null },
        { name: "شركة تداول", logo: null },
        { name: "شركة تداول", logo: null },
      ]
  ).concat([{ name: "+ المزيد", logo: null }]);
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div
        className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/20 blur-[85px]"
        aria-hidden
      />

      {/* Stage 1 — who comes to us */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <SourceNode icon={Users} title="المتداولون" subtitle="يبحثون عن وسيط موثوق" />
        <SourceNode icon={Share2} title="وكلاء IB" subtitle="يبحثون عن شراكة ماستر" />
      </div>

      <Flow />

      {/* Stage 2 — us, the hub */}
      <div className="relative">
        <div
          className="hub-pulse absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/25 blur-2xl"
          aria-hidden
        />
        <div className="glass-card mx-auto flex max-w-xs flex-col items-center px-6 py-5 ring-1 ring-brand-500/25">
          <LogoMark className="h-11 w-11" />
          <div className="mt-2 text-base font-extrabold tracking-wide text-white">
            FX Partners
          </div>
          <div className="mt-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-semibold text-brand-200">
            وسيط الشراكة · Master IB
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
            نتفاوض على الشروط · نجمّع الأحجام · نوزّع العمولات
          </p>
        </div>
      </div>

      <Flow />

      {/* Stage 3 — the broker network */}
      <div className="glass-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-300" />
          <span className="text-xs font-semibold text-slate-200">
            شبكة شركات التداول المرخّصة
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((tile, i) => (
            <div
              key={`${tile.name}-${i}`}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 backdrop-blur-md"
            >
              {tile.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tile.logo} alt="" className="h-4 w-4 shrink-0 rounded bg-white object-contain p-px" />
              ) : (
                <Building2 className="h-3 w-3 shrink-0 text-accent-300" />
              )}
              <span className="truncate text-[11px] font-semibold text-slate-300">{tile.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
