"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveResource, deleteResource, setResourceActive } from "@/lib/actions/resources";
import { Download, Trash2, Loader2, Plus, Eye, EyeOff } from "lucide-react";

export type AdminResource = {
  id: string;
  title: string;
  kind: string;
  file_url: string;
  downloads: number;
  is_active: boolean;
  broker_name: string | null;
};

const KIND_LABELS: Record<string, string> = {
  indicator: "مؤشر",
  template: "قالب",
  ebook: "كتاب",
  tool: "أداة",
};

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function ResourcesManager({
  resources,
  brokers,
}: {
  resources: AdminResource[];
  brokers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("indicator");
  const [fileUrl, setFileUrl] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!title.trim() || !fileUrl.trim()) {
      setError("العنوان ورابط الملف مطلوبان.");
      return;
    }
    setBusy("add");
    const res = await saveResource({ title, description, kind, fileUrl, brokerId: brokerId || null });
    setBusy(null);
    if (!res.ok) return setError(res.error ?? "تعذّر الحفظ");
    setTitle("");
    setDescription("");
    setFileUrl("");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(id);
    await deleteResource(id);
    setBusy(null);
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    setBusy(id);
    await setResourceActive(id, active);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card-surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={input} placeholder="عنوان الأداة" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
            {Object.entries(KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-ink-900">{v}</option>
            ))}
          </select>
        </div>
        <input className={input} placeholder="رابط الملف (Supabase Storage أو خارجي)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} dir="ltr" />
        <select className={input} value={brokerId} onChange={(e) => setBrokerId(e.target.value)}>
          <option value="" className="bg-ink-900">بدون شرط شركة (تحميل مباشر)</option>
          {brokers.map((b) => (
            <option key={b.id} value={b.id} className="bg-ink-900">فتح حساب عبر {b.name}</option>
          ))}
        </select>
        <textarea className={input} rows={2} placeholder="وصف مختصر (اختياري)" value={description} onChange={(e) => setDescription(e.target.value)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          onClick={add}
          disabled={busy === "add"}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          إضافة أداة
        </button>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد أدوات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li key={r.id} className="card-surface flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
                <Download className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">{r.title}</div>
                <div className="text-xs text-slate-500">
                  {KIND_LABELS[r.kind] ?? r.kind}
                  {r.broker_name ? ` · عبر ${r.broker_name}` : " · تحميل مباشر"} · {r.downloads} تحميل
                </div>
              </div>
              <button onClick={() => toggle(r.id, !r.is_active)} disabled={busy === r.id} className="p-2 text-slate-400 hover:text-white" aria-label={r.is_active ? "إخفاء" : "إظهار"}>
                {r.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button onClick={() => remove(r.id)} disabled={busy === r.id} className="p-2 text-slate-400 hover:text-red-300" aria-label="حذف">
                {busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
