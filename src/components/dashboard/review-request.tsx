"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, Copy, Check, MessageCircle } from "lucide-react";

type BrokerOption = { slug: string; name: string };

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white focus:border-brand-500/50 focus:outline-none";

/**
 * Ask a real client for a real review.
 *
 * The review form has always existed on every broker page, and it has zero
 * reviews — because nobody is ever asked. A comparison site whose ratings are
 * all empty has no comparison to offer, and the first review is the hardest
 * one: visitors do not volunteer on an empty page.
 *
 * Agents are the only people here with actual clients, so this gives them the
 * two things that make asking cheap: a link that opens the form directly, and
 * a message they can paste into WhatsApp or Telegram without writing it.
 *
 * It asks for an opinion — it does not supply one. Nothing here pre-fills a
 * rating or a comment.
 */
export function ReviewRequest({
  brokers,
  siteUrl,
}: {
  brokers: BrokerOption[];
  siteUrl: string;
}) {
  const [slug, setSlug] = useState(brokers[0]?.slug ?? "");
  const [copied, setCopied] = useState<string | null>(null);

  const broker = brokers.find((b) => b.slug === slug);
  const link = useMemo(
    () => (slug ? `${siteUrl}/brokers/${slug}?review=1` : ""),
    [siteUrl, slug]
  );

  const message = useMemo(() => {
    if (!broker) return "";
    return (
      `مرحباً 👋\n` +
      `إذا كانت تجربتك مع ${broker.name} جيدة (أو لم تكن)، تقييمك يساعد متداولين آخرين على اختيار شركتهم.\n\n` +
      `يستغرق أقل من دقيقة:\n${link}\n\n` +
      `اكتب رأيك بصراحة — الإيداع والسحب وسرعة التنفيذ والدعم.`
    );
  }, [broker, link]);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("تم النسخ");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("تعذّر النسخ");
    }
  }

  if (brokers.length === 0) {
    return (
      <section className="card-surface p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white sm:text-base">
          <Star className="h-4 w-4 text-brand-300" />
          اطلب مراجعة من عملائك
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          لا توجد شركات منشورة بعد لطلب مراجعات عنها.
        </p>
      </section>
    );
  }

  return (
    <section className="card-surface p-4 sm:p-6">
      <div className="flex items-start gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
          <Star className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-white sm:text-base">
            اطلب مراجعة من عملائك
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
            التقييمات الحقيقية هي ما يجعل صفحة الشركة تستحقّ القراءة — وهي لا
            تأتي إلا بالطلب. اختر الشركة وأرسل الرابط لعميل تعامل معها فعلاً.
          </p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm text-slate-300">الشركة</span>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputCls}
        >
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <span className="mb-1.5 block text-sm text-slate-300">رابط المراجعة</span>
        <div className="flex gap-2">
          <input readOnly value={link} dir="ltr" className={`${inputCls} text-xs`} />
          <button
            type="button"
            onClick={() => copy(link, "link")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-slate-300 transition hover:border-brand-400/50 hover:text-white"
          >
            {copied === "link" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          يفتح صفحة الشركة على نموذج المراجعة مباشرةً.
        </p>
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-sm text-slate-300">رسالة جاهزة</span>
        <textarea
          readOnly
          rows={6}
          value={message}
          dir="auto"
          className={`${inputCls} text-xs leading-relaxed`}
        />
        <button
          type="button"
          onClick={() => copy(message, "msg")}
          className="btn-gradient mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
        >
          {copied === "msg" ? (
            <Check className="h-4 w-4" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          انسخ الرسالة
        </button>
      </div>
    </section>
  );
}
