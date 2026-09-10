"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  saveAnnouncement,
  deleteAnnouncement,
} from "@/lib/actions/announcements";
import { categoryMeta, timeAgo } from "@/lib/announcements";
import { Plus, Trash2, Loader2, EyeOff } from "lucide-react";

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  category: string;
  is_published: boolean;
  published_at: string;
};

const CATEGORIES = [
  { value: "feature", label: "✨ ميزة جديدة" },
  { value: "promo", label: "🎁 عرض" },
  { value: "commission", label: "💰 عمولات" },
  { value: "news", label: "📢 خبر" },
];

export function AnnouncementsManager({
  items,
}: {
  items: AdminAnnouncement[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("feature");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

  async function publish() {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("العنوان والنص مطلوبان.");
      return;
    }
    setBusy("add");
    const res = await saveAnnouncement({ title, body, category, is_published: true });
    setBusy(null);
    if (res.ok) {
      setTitle("");
      setBody("");
      router.refresh();
    } else {
      setError(res.error ?? "تعذّر النشر.");
    }
  }

  async function remove(id: string) {
    setBusy(id);
    await deleteAnnouncement(id);
    setBusy(null);
    router.refresh();
  }

  async function toggle(a: AdminAnnouncement) {
    setBusy(a.id);
    await saveAnnouncement({
      id: a.id,
      title: a.title,
      body: a.body,
      category: a.category,
      is_published: !a.is_published,
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Plus className="h-4 w-4 text-brand-300" />
          نشر تحديث جديد
        </h2>
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="العنوان — مثال: رفعنا عمولة الذهب 5%"
              className={inputCls}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="نص التحديث الذي سيظهر للوكلاء…"
            className={inputCls}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={publish}
            disabled={busy === "add"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر"}
          </button>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">التحديثات ({items.length})</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد تحديثات بعد.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {items.map((a) => {
              const meta = categoryMeta(a.category);
              return (
                <li key={a.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${meta.className}`}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {timeAgo(a.published_at)}
                      </span>
                      {!a.is_published && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                          مخفي
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-medium text-white">{a.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{a.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => toggle(a)}
                      disabled={busy === a.id}
                      title={a.is_published ? "إخفاء" : "إظهار"}
                      className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
                    >
                      {busy === a.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      disabled={busy === a.id}
                      title="حذف"
                      className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
