"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  publishCampaign,
  setCampaignActive,
  deleteCampaign,
} from "@/lib/actions/campaigns";
import { Megaphone, Trash2, Loader2, Radio } from "lucide-react";

export type AdminCampaign = {
  id: string;
  broker_slug: string | null;
  title: string;
  message: string;
  cta_label: string | null;
  is_active: boolean;
  created_at: string;
};

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function CampaignsManager({
  campaigns,
  brokers,
}: {
  campaigns: AdminCampaign[];
  brokers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setError(null);
    if (!title.trim() || !message.trim()) {
      setError("العنوان والنص مطلوبان.");
      return;
    }
    setBusy("publish");
    const res = await publishCampaign({
      title,
      message,
      ctaLabel,
      brokerId: brokerId || null,
    });
    setBusy(null);
    if (res.ok) {
      setTitle("");
      setMessage("");
      setCtaLabel("");
      setBrokerId("");
      router.refresh();
    } else setError(res.error ?? "تعذّر النشر.");
  }

  return (
    <div className="space-y-8">
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Radio className="h-4 w-4 text-brand-300" /> إطلاق عرض فوري
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          فور الضغط على «إطلاق»، تظهر لافتة متحركة لكل الزوّار المتواجدين الآن —
          بدون إعادة تحميل.
        </p>
        <div className="mt-4 space-y-3">
          <input
            className={input}
            placeholder="العنوان — مثال: عرض حصري من Alpha Markets"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className={input}
            rows={2}
            placeholder="تفاصيل العرض — مثال: بونص 100% بدون إيداع لفترة محدودة"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className={input}
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
            >
              <option value="">اربط بشركة (اختياري)</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              className={input}
              placeholder="نص الزر (افتراضي: سجّل الآن)"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={publish}
            disabled={busy === "publish"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            إطلاق
          </button>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">العروض ({campaigns.length})</h2>
        {campaigns.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد عروض بعد.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {campaigns.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{c.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        c.is_active
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {c.is_active ? "نشط" : "متوقف"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{c.message}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={async () => {
                      setBusy(c.id);
                      await setCampaignActive(c.id, !c.is_active);
                      setBusy(null);
                      router.refresh();
                    }}
                    disabled={busy === c.id}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:text-white"
                  >
                    {c.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button
                    onClick={async () => {
                      setBusy(c.id);
                      await deleteCampaign(c.id);
                      setBusy(null);
                      router.refresh();
                    }}
                    disabled={busy === c.id}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    {busy === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
