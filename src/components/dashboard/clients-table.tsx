"use client";

import { useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { cn, formatCompact } from "@/lib/utils";

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

const columns: ColumnDef<ClientRow>[] = [
  {
    id: "client",
    header: "العميل",
    accessorFn: (r) => r.client_email || r.client_ref || "—",
    cell: (c) => <span className="text-white">{c.getValue<string>()}</span>,
  },
  {
    accessorKey: "campaign",
    header: "الحملة",
    cell: (c) => (
      <span className="text-slate-400">{c.getValue<string>() || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    enableSorting: false,
    cell: (c) => {
      const s = statusLabel[c.getValue<string>()] ?? statusLabel.lead;
      return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
          {s.text}
        </span>
      );
    },
  },
  {
    accessorKey: "trading_volume",
    header: "حجم التداول",
    cell: (c) => (
      <span dir="ltr">{formatCompact(Number(c.getValue<number>()))}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "التاريخ",
    cell: (c) => (
      <span className="text-slate-500">
        {new Date(c.getValue<string>()).toLocaleDateString("ar")}
      </span>
    ),
  },
];

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all").withOptions({ history: "replace", clearOnDefault: true })
  );

  const data = useMemo(
    () => (status === "all" ? rows : rows.filter((r) => r.status === status)),
    [rows, status]
  );

  const toolbar = (
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
  );

  return (
    <div className="card-surface p-6">
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="بحث بالبريد أو الحملة…"
        toolbar={toolbar}
        emptyText="لا توجد نتائج مطابقة."
      />
    </div>
  );
}
