"use client";

import { useState } from "react";
import { GripVertical, Loader2, Check } from "lucide-react";

export type SortableItem = {
  id: string;
  label: string;
  sublabel?: string;
  logo?: string | null;
};

/**
 * Drag-and-drop reorderable list (native HTML5 DnD — no dependency). Renders a
 * grip + item rows; dragging reorders live, and a "save order" button persists
 * the new order via the provided async handler.
 */
export function SortableList({
  items: initial,
  onSave,
  emptyText = "لا توجد عناصر.",
}: {
  items: SortableItem[];
  onSave: (orderedIds: string[]) => Promise<{ ok: boolean; error?: string }>;
  emptyText?: string;
}) {
  const [items, setItems] = useState<SortableItem[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = items.map((i) => i.id).join() !== initial.map((i) => i.id).join();

  function onDragEnter(overId: string) {
    if (!dragId || dragId === overId) return;
    setItems((cur) => {
      const from = cur.findIndex((i) => i.id === dragId);
      const to = cur.findIndex((i) => i.id === overId);
      if (from < 0 || to < 0) return cur;
      const next = [...cur];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await onSave(items.map((i) => i.id));
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            draggable
            onDragStart={() => setDragId(it.id)}
            onDragEnter={() => onDragEnter(it.id)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={() => setDragId(null)}
            className={`card-surface flex cursor-grab items-center gap-3 p-3 transition active:cursor-grabbing ${
              dragId === it.id ? "opacity-50 ring-1 ring-brand-500/40" : ""
            }`}
          >
            <GripVertical className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
            {it.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.logo}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-8 w-8 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-0.5"
              />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-black text-brand-300">
                {it.label.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{it.label}</div>
              {it.sublabel && <div className="truncate text-xs text-slate-500">{it.sublabel}</div>}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || busy}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "تم حفظ الترتيب" : "حفظ الترتيب"}
        </button>
        {dirty && !saved && <span className="text-xs text-slate-500">لديك تغييرات غير محفوظة</span>}
        {error && <span className="text-xs text-red-300">{error}</span>}
      </div>
    </div>
  );
}
