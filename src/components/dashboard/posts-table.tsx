"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DeletePostButton } from "@/components/dashboard/post-editor";
import { Pencil } from "lucide-react";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: string;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  draft: { text: "مسودة", cls: "bg-white/10 text-slate-300" },
  published: { text: "منشور", cls: "bg-brand-500/10 text-brand-300" },
  archived: { text: "مؤرشف", cls: "bg-gold-500/10 text-gold-400" },
};

const columns: ColumnDef<PostRow>[] = [
  {
    accessorKey: "title",
    header: "العنوان",
    cell: (c) => {
      const row = c.row.original;
      return (
        <div>
          <div className="font-medium text-white">{row.title}</div>
          <div className="font-mono text-xs text-slate-500">/{row.slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "الحالة",
    enableSorting: false,
    cell: (c) => {
      const s = statusLabel[c.getValue<string>()] ?? statusLabel.draft;
      return (
        <span className={`rounded-md px-2 py-1 text-xs ${s.cls}`}>{s.text}</span>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "آخر تحديث",
    cell: (c) => (
      <span className="text-slate-500">
        {new Date(c.getValue<string>()).toLocaleDateString("ar")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "إجراء",
    enableSorting: false,
    cell: (c) => (
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/dashboard/admin/posts/${c.row.original.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          تحرير
        </Link>
        <DeletePostButton id={c.row.original.id} />
      </div>
    ),
  },
];

export function PostsTable({ rows }: { rows: PostRow[] }) {
  return (
    <div className="card-surface p-6">
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="بحث في المنشورات…"
        emptyText="لا توجد منشورات بعد."
      />
    </div>
  );
}
