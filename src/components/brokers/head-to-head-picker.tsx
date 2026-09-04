"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Swords, ArrowLeft } from "lucide-react";

type Option = { slug: string; name: string };

export function HeadToHeadPicker({
  options,
  defaultA,
  defaultB,
}: {
  options: Option[];
  defaultA?: string;
  defaultB?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(defaultA ?? options[0]?.slug ?? "");
  const [b, setB] = useState(defaultB ?? options[1]?.slug ?? "");

  const select =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white focus:border-brand-500/50 focus:outline-none";

  const go = () => {
    if (a && b && a !== b) router.push(`/compare/vs?a=${a}&b=${b}`);
  };

  return (
    <div className="card-surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Swords className="h-4 w-4 text-brand-300" />
        <h3 className="text-sm font-semibold text-white">مقارنة مباشرة بين شركتين</h3>
      </div>
      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs text-slate-400">الشركة الأولى</span>
          <select className={select} value={a} onChange={(e) => setA(e.target.value)}>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <span className="hidden pb-3 text-center text-sm font-bold text-slate-500 sm:block">
          ضد
        </span>
        <label className="block">
          <span className="mb-1.5 block text-xs text-slate-400">الشركة الثانية</span>
          <select className={select} value={b} onChange={(e) => setB(e.target.value)}>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={go}
          disabled={!a || !b || a === b}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
        >
          قارن
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
      {a === b && (
        <p className="mt-2 text-xs text-amber-400">اختر شركتين مختلفتين.</p>
      )}
    </div>
  );
}
