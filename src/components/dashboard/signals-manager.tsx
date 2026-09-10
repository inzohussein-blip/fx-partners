"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  saveSignal,
  deleteSignal,
  addWebhook,
  deleteWebhook,
} from "@/lib/actions/signals";
import { directionMeta } from "@/lib/signals";
import { Plus, Trash2, Loader2, Send, Webhook } from "lucide-react";

export type AdminSignal = {
  id: string;
  broker_id: string | null;
  title: string;
  body: string;
  symbol: string | null;
  direction: string | null;
  published_at: string;
};

export type Hook = { id: string; label: string | null; url: string; is_active: boolean };
type BrokerOpt = { id: string; name: string };

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function SignalsManager({
  signals,
  hooks,
  brokers,
}: {
  signals: AdminSignal[];
  hooks: Hook[];
  brokers: BrokerOpt[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [broadcast, setBroadcast] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hookUrl, setHookUrl] = useState("");
  const [hookLabel, setHookLabel] = useState("");

  async function publish() {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("العنوان والنص مطلوبان.");
      return;
    }
    setBusy("signal");
    const res = await saveSignal({
      title,
      body,
      symbol,
      direction,
      brokerId: brokerId || null,
      broadcast,
    });
    setBusy(null);
    if (res.ok) {
      setTitle("");
      setBody("");
      setSymbol("");
      setDirection("");
      setBrokerId("");
      router.refresh();
    } else setError(res.error ?? "تعذّر النشر.");
  }

  return (
    <div className="space-y-8">
      {/* Compose */}
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Send className="h-4 w-4 text-brand-300" /> توصية / تحليل جديد
        </h2>
        <div className="mt-4 space-y-3">
          <input
            className={input}
            placeholder="العنوان — مثال: الذهب يستهدف 2400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className={input}
              dir="ltr"
              placeholder="الأداة (XAUUSD)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <select
              className={input}
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="">الاتجاه (اختياري)</option>
              <option value="buy">🟢 شراء</option>
              <option value="sell">🔴 بيع</option>
              <option value="neutral">⚪ محايد</option>
            </select>
            <select
              className={input}
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
            >
              <option value="">بدون شركة</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className={input}
            rows={4}
            placeholder="نص التحليل / التوصية…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={broadcast}
                onChange={(e) => setBroadcast(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-500"
              />
              بثّ فوري إلى تلغرام والويبهوكس
            </label>
            <button
              onClick={publish}
              disabled={busy === "signal"}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy === "signal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر وبثّ"}
            </button>
          </div>
        </div>
      </section>

      {/* Webhook endpoints */}
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Webhook className="h-4 w-4 text-brand-300" /> قنوات البثّ (Webhooks)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          أضِف روابط Webhook لقنوات Discord أو Skype أو أي نظام خارجي. قناة تلغرام
          تُضبط عبر متغيّر البيئة <code>TELEGRAM_SIGNALS_CHAT_ID</code>.
        </p>
        {hooks.length > 0 && (
          <ul className="mt-4 space-y-2">
            {hooks.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs"
              >
                <span className="min-w-0 truncate text-slate-300" dir="ltr">
                  {h.label ? `${h.label} · ` : ""}
                  {h.url}
                </span>
                <button
                  onClick={async () => {
                    setBusy(h.id);
                    await deleteWebhook(h.id);
                    setBusy(null);
                    router.refresh();
                  }}
                  disabled={busy === h.id}
                  className="shrink-0 text-slate-500 transition hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-[200px_1fr_auto]">
          <input
            className={input}
            placeholder="الاسم (اختياري)"
            value={hookLabel}
            onChange={(e) => setHookLabel(e.target.value)}
          />
          <input
            className={input}
            dir="ltr"
            placeholder="https://discord.com/api/webhooks/…"
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
          />
          <button
            onClick={async () => {
              if (!hookUrl.trim()) return;
              setBusy("hook");
              const res = await addWebhook(hookUrl, hookLabel);
              setBusy(null);
              if (res.ok) {
                setHookUrl("");
                setHookLabel("");
                router.refresh();
              }
            }}
            disabled={busy === "hook"}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500/15 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/25"
          >
            {busy === "hook" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إضافة
          </button>
        </div>
      </section>

      {/* Published signals */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">التوصيات ({signals.length})</h2>
        {signals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد توصيات بعد.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {signals.map((s) => {
              const dir = directionMeta(s.direction);
              return (
                <li key={s.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{s.title}</span>
                      {s.symbol && (
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400" dir="ltr">
                          {s.symbol}
                        </span>
                      )}
                      {dir && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${dir.className}`}>
                          {dir.emoji} {dir.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{s.body}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setBusy(s.id);
                      await deleteSignal(s.id);
                      setBusy(null);
                      router.refresh();
                    }}
                    disabled={busy === s.id}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    {busy === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
