"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { saveContent } from "@/lib/actions/admin";
import {
  CONTENT_GROUPS,
  type ContentBlock,
} from "@/lib/content-registry";
import { FileText, Pencil, Search, Loader2, Check, Plus, Trash2 } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

type ListItem = Record<string, string>;
type DraftValue = string | ListItem[];

export function ContentStudio({
  blocks,
  values,
}: {
  blocks: ContentBlock[];
  values: Record<string, Record<string, unknown>>;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [draft, setDraft] = useState<Record<string, DraftValue>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim();
    return blocks.filter(
      (b) =>
        (group === "all" || b.group === group) &&
        (!term ||
          b.title.includes(term) ||
          (b.description ?? "").includes(term) ||
          b.key.includes(term))
    );
  }, [blocks, q, group]);

  function open(block: ContentBlock) {
    setEditing(block);
    setError(null);
    setDraft(
      Object.fromEntries(
        block.fields.map((f) => {
          const stored = values[block.key]?.[f.name];
          if (f.type === "list") {
            return [f.name, Array.isArray(stored) ? (stored as ListItem[]) : []];
          }
          return [f.name, typeof stored === "string" ? stored : ""];
        })
      )
    );
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    const res = await saveContent(editing.key, draft);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setSavedKey(editing.key);
    setEditing(null);
    router.refresh();
    setTimeout(() => setSavedKey(null), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن نص أو قسم…"
            className={`${inputCls} pe-10`}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...CONTENT_GROUPS].map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                group === g ? "bg-brand-500/15 text-brand-200" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {g === "all" ? "الكل" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => {
          const preview = Object.values(values[b.key] ?? {})
            .map((v) =>
              Array.isArray(v)
                ? v.length
                  ? `${v.length} عنصر`
                  : ""
                : typeof v === "string"
                  ? v
                  : ""
            )
            .filter(Boolean)
            .join(" · ");
          return (
            <button
              key={b.key}
              onClick={() => open(b)}
              className="card-surface group flex flex-col p-5 text-start transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition group-hover:text-brand-300">
                  {savedKey === b.key ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> حُفظ
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3.5 w-3.5" /> تعديل
                    </>
                  )}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-white">{b.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{b.group}</p>
              {preview && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400" dir="auto">
                  {preview}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">لا توجد نتائج مطابقة.</p>
      )}

      {/* Edit modal */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.title ?? ""}
        description={editing?.description}
        footer={
          <>
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              حفظ
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editing?.fields.map((f) => {
            if (f.type === "list") {
              const items = (draft[f.name] as ListItem[] | undefined) ?? [];
              const setItems = (next: ListItem[]) =>
                setDraft((d) => ({ ...d, [f.name]: next }));
              return (
                <div key={f.name}>
                  <span className="mb-1.5 block text-sm text-slate-300">{f.label}</span>
                  {f.hint && <p className="mb-3 text-xs text-slate-500">{f.hint}</p>}

                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">#{i + 1}</span>
                          <button
                            type="button"
                            onClick={() => setItems(items.filter((_, j) => j !== i))}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(f.itemFields ?? []).map((sub) => (
                            <label key={sub.name} className="block">
                              <span className="mb-1 block text-xs text-slate-400">{sub.label}</span>
                              {sub.multiline ? (
                                <textarea
                                  rows={3}
                                  value={item[sub.name] ?? ""}
                                  onChange={(e) =>
                                    setItems(
                                      items.map((it, j) =>
                                        j === i ? { ...it, [sub.name]: e.target.value } : it
                                      )
                                    )
                                  }
                                  className={inputCls}
                                  dir="auto"
                                />
                              ) : (
                                <input
                                  value={item[sub.name] ?? ""}
                                  onChange={(e) =>
                                    setItems(
                                      items.map((it, j) =>
                                        j === i ? { ...it, [sub.name]: e.target.value } : it
                                      )
                                    )
                                  }
                                  className={inputCls}
                                  dir="auto"
                                />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setItems([
                        ...items,
                        Object.fromEntries((f.itemFields ?? []).map((sf) => [sf.name, ""])),
                      ])
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-brand-400/50 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة عنصر
                  </button>

                  {items.length === 0 && (
                    <p className="mt-3 text-xs text-slate-500">
                      القائمة فارغة — القسم لن يظهر على الموقع.
                    </p>
                  )}
                </div>
              );
            }

            const value = typeof draft[f.name] === "string" ? (draft[f.name] as string) : "";
            return (
              <label key={f.name} className="block">
                <span className="mb-1.5 block text-sm text-slate-300">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                    className={inputCls}
                    dir="auto"
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                    className={inputCls}
                    dir="auto"
                  />
                )}
                {f.hint && <p className="mt-1 text-xs text-slate-500">{f.hint}</p>}
              </label>
            );
          })}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
}
