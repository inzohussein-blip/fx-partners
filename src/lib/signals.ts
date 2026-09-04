export type Signal = {
  id: string;
  broker_id: string | null;
  title: string;
  body: string;
  symbol: string | null;
  direction: string | null;
  published_at: string;
};

export const DIRECTION_META: Record<
  string,
  { label: string; className: string; emoji: string }
> = {
  buy: { label: "شراء", className: "bg-emerald-500/15 text-emerald-300", emoji: "🟢" },
  sell: { label: "بيع", className: "bg-red-500/15 text-red-300", emoji: "🔴" },
  neutral: { label: "محايد", className: "bg-white/10 text-slate-300", emoji: "⚪" },
};

export function directionMeta(dir: string | null) {
  return dir ? DIRECTION_META[dir] : null;
}
