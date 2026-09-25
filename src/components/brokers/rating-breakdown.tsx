import { Link } from "@/i18n/navigation";
import { MessageSquarePlus, Users } from "lucide-react";
import { Stars } from "@/components/brokers/stars";
import { isRated, type Broker } from "@/lib/brokers";

/**
 * The broker's rating section — our rating comes from approved reviews and
 * nothing else (see /methodology, section 2).
 *
 * It used to average in scores derived from the licence count, the spread and
 * the bonus flags whenever there were no reviews, and print the result as a
 * large "4.9 / 5" under a note saying it was built on real user reviews. With
 * zero reviews that was a number the site had in effect written by hand — and
 * it sat directly under the header's external score, so a visitor saw two
 * different ratings for the same broker. Unrated brokers now say so, and point
 * at the review form.
 */
export function RatingBreakdown({ broker }: { broker: Broker }) {
  if (!isRated(broker)) {
    return (
      <div className="card-surface flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-400/20">
          <MessageSquarePlus className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-fg">لم تُقيَّم بعد</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            تقييمنا يُحسب من مراجعات العملاء المعتمدة فقط، ولا نضع رقماً قبل وصولها.
            {broker.external_score != null &&
              " التقييم الظاهر أعلى الصفحة من مصدر خارجي غير موثّق."}
          </p>
        </div>
        <a
          href="#reviews"
          className="inline-flex min-h-11 items-center rounded-xl bg-fg/[0.06] px-4 text-sm font-medium text-fg ring-1 ring-fg/10 transition hover:bg-fg/10"
        >
          كن أول من يقيّم
        </a>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-5">
        <div className="text-5xl font-extrabold leading-none text-gradient" dir="ltr">
          {broker.rating.toFixed(1)}
        </div>
        <div className="space-y-1.5">
          <Stars value={broker.rating} size={18} />
          <div className="inline-flex items-center gap-1.5 text-sm text-slate-400">
            <Users className="h-4 w-4 text-brand-300" />
            من 5 · {broker.reviews_count.toLocaleString("en-US")} مراجعة معتمدة
          </div>
        </div>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        محسوب من مراجعات العملاء المعتمدة فقط.{" "}
        <Link href="/methodology" className="text-brand-300 underline-offset-4 hover:underline">
          كيف نقيّم؟
        </Link>
      </p>
    </div>
  );
}
