"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Enable the global search box with this placeholder. */
  searchPlaceholder?: string;
  /** Extra controls (e.g. status filters) shown next to the search box. */
  toolbar?: React.ReactNode;
  pageSize?: number;
  emptyText?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  toolbar,
  pageSize = 10,
  emptyText = "لا توجد نتائج.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const total = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {(searchPlaceholder || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchPlaceholder && (
            <div className="relative sm:w-72">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-white/5 text-slate-400">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="pb-3 font-medium">
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-white"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : sorted === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="text-slate-300">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {total === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
        )}
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{total} نتيجة</span>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <PagerButton
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              السابق
            </PagerButton>
            <span className="text-slate-400">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <PagerButton
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              التالي
            </PagerButton>
          </div>
        )}
      </div>
    </div>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg bg-white/5 px-3 py-1.5 font-medium text-slate-200 transition hover:bg-white/10",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}
