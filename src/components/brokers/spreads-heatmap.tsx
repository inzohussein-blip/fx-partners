"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Gauge } from "lucide-react";
import type { SpreadRow } from "@/lib/spreads";

const CATEGORY_LABELS: Record<string, string> = {
  metals: "المعادن",
  forex: "الفوركس",
  indices: "المؤشرات",
  crypto: "العملات الرقمية",
};

// Relative colour per instrument: green = cheapest, amber = mid, red = worst.
// The numeric value printed in each cell is the primary (non-colour) cue.
function cellClass(spread: number, min: number, max: number): string {
  if (max <= min) return "bg-emerald-500/15 text-emerald-300";
  const t = (spread - min) / (max - min);
  if (t <= 1 / 3) return "bg-emerald-500/15 text-emerald-300";
  if (t <= 2 / 3) return "bg-amber-500/15 text-amber-300";
  return "bg-rose-500/15 text-rose-300";
}

export function SpreadsHeatmap({ rows }: { rows: SpreadRow[] }) {
  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).filter(Boolean),
    [rows]
  );
  const [category, setCategory] = useState<string>("");
  const activeCat = category || categories[0] || "";

  const catRows = useMemo(
    () => rows.filter((r) => r.category === activeCat),
    [rows, activeCat]
  );
  const instruments = useMemo(
    () => Array.from(new Set(catRows.map((r) => r.instrument))),
    [catRows]
  );
  const brokers = useMemo(() => {
    const map = new Map<string, { name: string; slug: string | null; logo: string | null }>();
    for (const r of catRows)
      if (!map.has(r.brokerId))
        map.set(r.brokerId, { name: r.brokerName, slug: r.brokerSlug, logo: r.logoUrl });
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [catRows]);

  const matrix = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const r of catRows) {
      if (!m.has(r.brokerId)) m.set(r.brokerId, new Map());
      m.get(r.brokerId)!.set(r.instrument, r.spread);
    }
    return m;
  }, [catRows]);

  const bounds = useMemo(() => {
    const b = new Map<string, { min: number; max: number }>();
    for (const inst of instruments) {
      const vals = catRows.filter((r) => r.instrument === inst).map((r) => r.spread);
      b.set(inst, { min: Math.min(...vals), max: Math.max(...vals) });
    }
    return b;
  }, [instruments, catRows]);

  const best = useMemo(() => {
    let bestRow: SpreadRow | null = null;
    for (const r of catRows) if (!bestRow || r.spread < bestRow.spread) bestRow = r;
    return bestRow;
  }, [catRows]);

  if (rows.length === 0) {
    return (
      <div className="card-surface p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
          <Gauge className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-white">لا توجد بيانات سبريد بعد</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
          تُضاف من لوحة التحكم أو جدول <code className="text-brand-300">broker_spreads</code> في Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              c === activeCat
                ? "border-brand-500 bg-brand-gradient text-white shadow-glow"
                : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[c] || c}
          </button>
        ))}
      </div>

      {/* Best spread now */}
      {best && (
        <div className="card-surface flex flex-wrap items-center justify-between gap-3 border-emerald-500/25 p-4">
          <div>
            <div className="text-xs text-slate-500">
              أفضل سبريد الآن — {CATEGORY_LABELS[activeCat] || activeCat}
            </div>
            <div className="mt-0.5 text-lg font-bold text-white">
              {best.brokerName} · {best.instrument}
            </div>
          </div>
          <div dir="ltr" className="text-2xl font-extrabold text-emerald-400">{best.spread}</div>
        </div>
      )}

      {/* Legend */}
      <p className="text-xs text-slate-500">
        الألوان مقارنة نسبية لكل أداة على حدة: الأقل{" "}
        <span className="font-bold text-emerald-300">أخضر</span>، الأوسط{" "}
        <span className="font-bold text-amber-300">أصفر</span>، الأعلى{" "}
        <span className="font-bold text-rose-300">أحمر</span>. اسحب الجدول أفقياً لبقية الأدوات.
      </p>

      {/* Heatmap table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky end-0 z-10 min-w-[160px] border-b border-s border-white/5 bg-ink-800 p-3 text-start text-slate-400">
                الشركة
              </th>
              {instruments.map((inst) => (
                <th
                  key={inst}
                  dir="ltr"
                  className="min-w-[100px] whitespace-nowrap border-b border-white/5 p-3 text-center font-bold text-slate-300"
                >
                  {inst}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brokers.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="sticky end-0 z-10 border-b border-s border-white/5 bg-ink-800 p-3">
                  <Link
                    href={`/brokers/${b.slug || b.id}`}
                    className="flex items-center gap-2 text-white hover:text-brand-300"
                  >
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logo}
                        alt={b.name}
                        loading="lazy"
                        decoding="async"
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white object-contain p-0.5"
                      />
                    ) : (
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-xs font-black text-brand-300">
                        {b.name.charAt(0)}
                      </span>
                    )}
                    <span className="max-w-[110px] truncate font-medium">{b.name}</span>
                  </Link>
                </td>
                {instruments.map((inst) => {
                  const val = matrix.get(b.id)?.get(inst);
                  const bnd = bounds.get(inst);
                  return (
                    <td key={inst} className="border-b border-white/5 p-0 text-center">
                      {val != null && bnd ? (
                        <div dir="ltr" className={`m-1 rounded-lg py-2 font-bold ${cellClass(val, bnd.min, bnd.max)}`}>
                          {val}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
