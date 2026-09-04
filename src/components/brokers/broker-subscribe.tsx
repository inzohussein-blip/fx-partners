"use client";

import { useState } from "react";
import { subscribeBroker } from "@/lib/actions/brokers";
import { Bell, Check, Loader2 } from "lucide-react";

export function BrokerSubscribe({
  brokerId,
  brokerName,
}: {
  brokerId: string;
  brokerName: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await subscribeBroker({ brokerId, email });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "تعذّر الاشتراك.");
  }

  return (
    <div className="card-surface relative overflow-hidden p-6">
      <div className="hero-glow absolute inset-0 opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-white">تنبيهات عروض {brokerName}</h3>
            <p className="text-xs text-slate-400">
              اشترك لتصلك التحديثات فور تغيّر البونص أو الشروط.
            </p>
          </div>
        </div>

        {done ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
            <Check className="h-4 w-4" /> تم اشتراكك! سنراسلك عند أي تحديث.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="flex-1 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "اشترك"}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
