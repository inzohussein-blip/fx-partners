"use client";

import { useMemo, useState } from "react";
import { cn, formatCompact } from "@/lib/utils";
import { Search, ArrowUpDown } from "lucide-react";

export type ClientRow = {
  id: string;
  client_email: string | null;
  client_ref: string | null;
  status: string;
  trading_volume: number;
  created_at: string;
  campaign: string | null;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  lead: { text: "عميل محتمل", cls: "bg-white/10 text-slate-300" },
  registered: { text: "مسجّل", cls: "bg-blue-500/10 text-blue-300" },
  funded: { text: "مموّل", cls: "bg-gold-500/10 text-gold-400" },
  active: { text: "نشط", cls: "bg-brand-500/10 text-brand-300" },
};

const filters = [
  { value: "all", label: "الكل" },
  { value: "lead", label: "محتمل" },
  { value: "registered", label: "مسجّل" },
  { value: "funded", label: "مموّل" },
  { value: "active", label: "نشط" },
];

type SortKey = "created_at" | "trading_volume";

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [asc, setAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.client_email?.toLowerCase().includes(q) ||
        r.client_ref?.toLowerCase().includes(q) ||
        r.campaign?.toLowerCase().includes(q);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      const av =
        sortKey === "created_at"
          ? new Date(a.created_at).getTime()
          : Number(a.trading_volume);
      const bv =
        sortKey === "created_at"
          ? new Date(b.created_at).getTime()
          : Number(b.trading_volume);
      return asc ? av - bv : bv - av;
    });
    return list;
  }, [rows, query, status, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <div className="card-surface p-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالبريد أو الحملة…"
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                status === f.value
                  ? "bg-brand-500/15 text-brand-200"
                  : "bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead>
            <tr className="border-b border-white/5 text-slate-400">
              <th className="pb-3 font-medium">العميل</th>
              <th className="pb-3 font-medium">الحملة</th>
              <th className="pb-3 font-medium">الحالة</th>
              <th className="pb-3 font-medium">
                <button
                  onClick={() => toggleSort("trading_volume")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  حجم التداول
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="pb-3 font-medium">
                <button
                  onClick={() => toggleSort("created_at")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  التاريخ
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((r) => {
              const s = statusLabel[r.status] ?? statusLabel.lead;
              return (
                <tr key={r.id} className="text-slate-300">
                  <td className="py-3">
                    <div className="text-white">
                      {r.client_email || r.client_ref || "—"}
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{r.campaign || "—"}</td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>
                      {s.text}
                    </span>
                  </td>
                  <td className="py-3" dir="ltr">
                    {formatCompact(Number(r.trading_volume))}
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(r.created_at).toLocaleDateString("ar")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            لا توجد نتائج مطابقة.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {filtered.length} من {rows.length} عميل
      </p>
    </div>
  );
}
