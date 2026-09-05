"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { RESOURCE_KINDS, type TradingResource } from "@/lib/resource-kinds";
import { Download, Lock, X, ArrowLeft, CheckCircle2 } from "lucide-react";

const UNLOCK_PREFIX = "fxp_res_unlock_";

export function ResourceCard({ resource }: { resource: TradingResource }) {
  const kind = RESOURCE_KINDS[resource.kind] ?? RESOURCE_KINDS.tool;
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState("");
  const gated = Boolean(resource.brokerName);

  function alreadyUnlocked(): boolean {
    try {
      return localStorage.getItem(UNLOCK_PREFIX + resource.id) === "1";
    } catch {
      return false;
    }
  }

  function download() {
    try {
      localStorage.setItem(UNLOCK_PREFIX + resource.id, "1");
    } catch {
      /* ignore */
    }
    window.open(resource.file_url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function onClick() {
    if (!gated || alreadyUnlocked()) {
      download();
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <div className="card-surface group flex flex-col p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-xl ring-1 ring-brand-500/20">
            {kind.emoji}
          </span>
          <div className="min-w-0">
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
              {kind.label}
            </span>
            <h3 className="mt-1 truncate font-bold text-white">{resource.title}</h3>
          </div>
        </div>
        {resource.description && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400" dir="auto">
            {resource.description}
          </p>
        )}
        <button
          onClick={onClick}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          {gated ? <Lock className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          تحميل مجاني
        </button>
      </div>

      {/* Gate modal */}
      {open && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تفعيل التحميل"
            className="card-surface relative z-10 w-full max-w-sm overflow-hidden p-0"
          >
            <div className="hero-glow relative p-6 text-center">
              <button onClick={() => setOpen(false)} className="absolute end-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="إغلاق">
                <X className="h-4 w-4" />
              </button>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/20">
                <Lock className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-white">فعّل التحميل مجاناً</h2>
              <p className="mt-1 text-sm text-slate-400">
                لتحميل «{resource.title}» افتح حساباً عبر رابطنا في {resource.brokerName} وأدخل رقم حسابك.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <Link
                href={resource.brokerHref || "#"}
                target="_blank"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20"
              >
                1) افتح الحساب عبر {resource.brokerName}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>

              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-300">2) رقم حسابك لدى الشركة</span>
                <input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="مثال: 123456"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
                />
              </label>

              <button
                onClick={download}
                disabled={account.trim().length < 3}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                تأكيد وتحميل الأداة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
