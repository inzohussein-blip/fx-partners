"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";

type Option = { slug: string; name: string };

/** Two broker selects + "Compare now" that routes to /compare/vs?a=&b=. */
export function ComparePicker({ options }: { options: Option[] }) {
  const t = useTranslations("CompareTeaser");
  const router = useRouter();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [pending, setPending] = useState(false);

  const ready = a && b && a !== b;

  function go() {
    if (!ready) return;
    setPending(true);
    router.push(`/compare/vs?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`);
  }

  const selectCls =
    "w-full appearance-none rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-white transition focus:border-brand-500/50 focus:outline-none";

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-400">{t("select1")}</span>
        <select value={a} onChange={(e) => setA(e.target.value)} className={selectCls}>
          <option value="">{t("selectPlaceholder")}</option>
          {options.map((o) => (
            <option key={o.slug} value={o.slug} disabled={o.slug === b}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-400">{t("select2")}</span>
        <select value={b} onChange={(e) => setB(e.target.value)} className={selectCls}>
          <option value="">{t("selectPlaceholder")}</option>
          {options.map((o) => (
            <option key={o.slug} value={o.slug} disabled={o.slug === a}>
              {o.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={go}
        disabled={!ready || pending}
        className="btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t("cta")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </>
        )}
      </button>

      {a && b && a === b && (
        <p className="text-center text-xs text-amber-300">{t("hint")}</p>
      )}
    </div>
  );
}
