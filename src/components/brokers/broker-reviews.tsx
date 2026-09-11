"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitBrokerReview } from "@/lib/actions/brokers";
import { Stars, StarInput } from "@/components/brokers/stars";
import type { BrokerReview } from "@/lib/brokers";
import { ShieldCheck, Loader2, Check } from "lucide-react";

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 30) return `قبل ${days} يوم`;
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

export function BrokerReviews({
  brokerId,
  brokerSlug,
  initial,
}: {
  brokerId: string;
  brokerSlug: string;
  initial: BrokerReview[];
}) {
  const [reviews, setReviews] = useState<BrokerReview[]>(initial);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [invited, setInvited] = useState(false);

  // `?review=1` is the link an agent sends a client they have just onboarded.
  // Landing mid-page on a long broker review, the form is far below the fold,
  // so the deep link scrolls to it and marks it — otherwise the person who
  // followed an explicit "leave a review" link has to go hunting for the box.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("review") !== "1") return;
    setInvited(true);
    const t = setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      300
    );
    return () => clearTimeout(t);
  }, []);

  // Live moderation: refetch approved reviews when the table changes.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();

    async function refresh() {
      const { data } = await supabase
        .from("broker_reviews")
        .select("id,user_name,comment,stars,is_admin_reply,created_at")
        .eq("broker_id", brokerId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (data) setReviews(data as BrokerReview[]);
    }

    const channel = supabase
      .channel(`broker_reviews:${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_reviews",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await submitBrokerReview({
      brokerId,
      brokerSlug,
      userName: name,
      comment,
      stars,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      setName("");
      setComment("");
      setStars(5);
    } else {
      setError(res.error ?? "تعذّر إرسال التعليق.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Reviews list */}
      <div>
        <h2 className="text-xl font-bold text-white">
          مراجعات العملاء ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <button
            type="button"
            onClick={() =>
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            className="mt-4 w-full rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/[0.04] px-5 py-8 text-center transition hover:border-brand-400/50 hover:bg-brand-500/[0.08]"
          >
            <span className="block text-sm font-bold text-white">
              لا توجد مراجعات بعد — كن أول من يشارك تجربته
            </span>
            <span className="mt-1.5 block text-xs text-slate-400">
              تجربتك الحقيقية مع هذه الشركة تساعد متداولاً آخر على القرار.
            </span>
          </button>
        ) : (
          <ul className="mt-5 space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className={`rounded-2xl border p-5 ${
                  r.is_admin_reply
                    ? "border-brand-500/30 bg-brand-500/[0.06]"
                    : "border-white/5 bg-ink-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {r.user_name || "عميل"}
                    </span>
                    {r.is_admin_reply && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] text-brand-200">
                        <ShieldCheck className="h-3 w-3" /> الإدارة
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600">{timeAgo(r.created_at)}</span>
                </div>
                <Stars value={r.stars} className="mt-2" />
                <p className="mt-2 text-sm leading-relaxed text-slate-300" dir="auto">
                  {r.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submission form */}
      <div
        ref={formRef}
        className={`card-surface h-fit scroll-mt-24 p-6 ${
          invited ? "ring-2 ring-brand-400/50" : ""
        }`}
      >
        {done ? (
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-500/15 text-brand-300">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-bold text-white">شكراً لمشاركتك!</h3>
            <p className="mt-2 text-sm text-slate-400">
              تعليقك قيد المراجعة وسيظهر بعد اعتماده من الإدارة.
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-4 text-sm text-brand-300 hover:text-brand-200"
            >
              إضافة مراجعة أخرى
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="font-bold text-white">أضف مراجعتك</h3>
            {invited && (
              <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs leading-relaxed text-brand-100">
                شاركنا تجربتك الحقيقية مع هذه الشركة — الإيداع والسحب والتنفيذ
                والدعم. تُنشر بعد مراجعة الإدارة.
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">تقييمك</label>
              <StarInput value={stars} onChange={setStars} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">الاسم</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="اسمك أو اسم مستعار"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">تعليقك</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder="شاركنا تجربتك مع هذه الشركة…"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإرسال…
                </>
              ) : (
                "إرسال المراجعة"
              )}
            </button>
            <p className="text-xs text-slate-600">
              تخضع كل المراجعات لمراجعة الإدارة قبل النشر.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
