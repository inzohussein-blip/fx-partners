"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveCoupon, setCouponActive, deleteCoupon } from "@/lib/actions/coupons";
import { Ticket, Trash2, Loader2, Plus } from "lucide-react";

export type AdminCoupon = {
  id: string;
  broker_name: string | null;
  title: string;
  code: string;
  referral_url: string | null;
  is_active: boolean;
};

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function CouponsManager({
  coupons,
  brokers,
}: {
  coupons: AdminCoupon[];
  brokers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [referralUrl, setReferralUrl] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!title.trim() || !code.trim()) {
      setError("العنوان والكود مطلوبان.");
      return;
    }
    setBusy("add");
    const res = await saveCoupon({
      title,
      code,
      brokerId: brokerId || null,
      referralUrl,
      description,
    });
    setBusy(null);
    if (res.ok) {
      setTitle("");
      setCode("");
      setBrokerId("");
      setReferralUrl("");
      setDescription("");
      router.refresh();
    } else setError(res.error ?? "تعذّرت الإضافة.");
  }

  return (
    <div className="space-y-8">
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Ticket className="h-4 w-4 text-brand-300" /> إضافة كوبون حصري
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          اترك الرابط فارغاً وسنستخدم رابط الإحالة المتتبَّع (/go) للشركة المختارة
          تلقائياً.
        </p>
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={input}
              placeholder="العنوان — مثال: بونص 100% حصري"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={input}
              dir="ltr"
              placeholder="الكود — مثال: FXP100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
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
              dir="ltr"
              placeholder="رابط الإحالة (اختياري)"
              value={referralUrl}
              onChange={(e) => setReferralUrl(e.target.value)}
            />
          </div>
          <input
            className={input}
            placeholder="وصف مختصر (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={add}
            disabled={busy === "add"}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إضافة
          </button>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">الكوبونات ({coupons.length})</h2>
        {coupons.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد كوبونات بعد.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {coupons.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{c.title}</span>
                    <span className="rounded bg-brand-500/15 px-2 py-0.5 font-mono text-[11px] text-brand-200" dir="ltr">
                      {c.code}
                    </span>
                    {!c.is_active && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                        متوقف
                      </span>
                    )}
                  </div>
                  {c.broker_name && (
                    <p className="mt-0.5 text-xs text-slate-500">{c.broker_name}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={async () => {
                      setBusy(c.id);
                      await setCouponActive(c.id, !c.is_active);
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
                      await deleteCoupon(c.id);
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
