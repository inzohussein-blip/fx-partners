"use client";

import { useRouter } from "next/navigation";
import { SortableList, type SortableItem } from "@/components/dashboard/sortable-list";
import { reorderRecords } from "@/lib/actions/reorder";

/** Drag-to-reorder panel for an allowed table, persisting sort_order. */
export function ReorderPanel({
  table,
  items,
}: {
  table: string;
  items: SortableItem[];
}) {
  const router = useRouter();
  return (
    <SortableList
      items={items}
      onSave={async (ids) => {
        const res = await reorderRecords(table, ids);
        if (res.ok) router.refresh();
        return res;
      }}
    />
  );
}
