"use client";

import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";

export type Coupon = {
  id: string;
  broker_name: string | null;
  title: string;
  code: string;
  referral_url: string | null;
  description: string | null;
};

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  async function copyAndGo() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; still proceed to the broker */
    }
    if (coupon.referral_url) {
      window.open(coupon.referral_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="card-surface relative overflow-hidden p-6">
      <div className="hero-glow absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/20">
            <Ticket className="h-4 w-4" />
          </span>
          {coupon.broker_name && (
            <span className="text-sm font-semibold text-white">{coupon.broker_name}</span>
          )}
        </div>

        <h3 className="mt-3 text-base font-bold text-white">{coupon.title}</h3>
        {coupon.description && (
          <p className="mt-1.5 text-sm text-slate-400" dir="auto">
            {coupon.description}
          </p>
        )}

        {/* Coupon code ticket */}
        <div className="mt-4 flex items-stretch overflow-hidden rounded-xl border border-dashed border-brand-500/40">
          <div
            dir="ltr"
            className="flex flex-1 items-center justify-center bg-ink-900/60 px-3 py-3 font-mono text-lg font-bold tracking-widest text-brand-200"
          >
            {coupon.code}
          </div>
          <button
            onClick={copyAndGo}
            className="inline-flex items-center gap-1.5 bg-brand-gradient px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "تم النسخ" : "انسخ وانتقل"}
          </button>
        </div>
      </div>
    </div>
  );
}
