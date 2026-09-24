import { Stars } from "@/components/brokers/stars";
import { isRated, externalStars, type Broker } from "@/lib/brokers";

/**
 * The rating shown on a broker, in priority order:
 *  1. our own review-based rating (real reviews),
 *  2. otherwise a third-party directory score, rendered as stars but
 *     clearly attributed to its source and shown on a /10 scale — never
 *     presented as our own rating,
 *  3. otherwise "not rated yet".
 */
export function BrokerRating({ broker, size = 16 }: { broker: Broker; size?: number }) {
  if (isRated(broker)) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Stars value={broker.rating} size={size} />
        <span className="text-xs text-slate-500" dir="ltr">
          {broker.rating.toFixed(1)} ({broker.reviews_count})
        </span>
      </span>
    );
  }

  const ext = externalStars(broker);
  if (ext != null) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Stars value={ext} size={size} />
        <span className="text-xs text-slate-500" dir="ltr">
          {broker.external_score?.toFixed(1)}/10
        </span>
        <span
          className="rounded bg-fg/5 px-1.5 py-0.5 text-[10px] text-slate-400 ring-1 ring-fg/10"
          title="تقييم مبدئي من مصدر خارجي لم تتحقّق منه المنصّة بعد — يُستبدَل بتقييم العملاء عند وصول المراجعات"
        >
          مبدئي
        </span>
      </span>
    );
  }

  return <span className="text-xs text-slate-500">لم تُقيَّم بعد</span>;
}
