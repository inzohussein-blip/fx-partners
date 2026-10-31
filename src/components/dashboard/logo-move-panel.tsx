"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageDown, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { moveLogosToStorage, type LogoMoveRow } from "@/lib/actions/brokers";

/**
 * One button that copies every outside logo (Google, Wikipedia, broker CDNs)
 * into our own storage. Shown only while some remain; lists any that failed
 * so the admin can upload those by hand.
 */
export function LogoMovePanel({ pending }: { pending: number }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [rows, setRows] = useState<LogoMoveRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (pending === 0 && !rows) return null;

  function run() {
    setError(null);
    start(async () => {
      const res = await moveLogosToStorage();
      if (!res.ok) setError(res.error ?? "تعذّر النقل");
      else setRows(res.rows ?? []);
      router.refresh();
    });
  }

  const failed = rows?.filter((r) => !r.ok) ?? [];
  const moved = rows ? rows.length - failed.length : 0;

  return (
    <div className="card-surface space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-fg">نقل الشعارات إلى موقعك</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {pending > 0
              ? `${pending} شعاراً ما زال يُحمَّل من مواقع خارجية. انقلها مرة واحدة لتُخزَّن عندك مصغّرة وسريعة.`
              : "كل الشعارات مخزّنة في موقعك."}
          </p>
        </div>
        {pending > 0 && (
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
            {busy ? "جارٍ النقل…" : "نقل الشعارات"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {rows && (
        <div className="space-y-2 text-xs">
          <p className="inline-flex items-center gap-1.5 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> نُقل {moved} شعاراً.
          </p>
          {failed.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="mb-2 inline-flex items-center gap-1.5 font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4" /> لم يُنقل {failed.length}. ارفع شعاراتها يدوياً من نموذج التعديل:
              </p>
              <ul className="space-y-1 text-slate-400">
                {failed.map((r) => (
                  <li key={`${r.table}-${r.name}`}>
                    <span className="font-medium text-slate-200">{r.name}</span>
                    {r.table === "partners" ? " (شريك)" : ""}: {r.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
