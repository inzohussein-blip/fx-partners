import { Clock } from "lucide-react";

/**
 * A "best for X" list that has no qualifying broker yet. Shown muted and not
 * as a link — its page would 404, and the sitemap leaves it out — so the grid
 * reads as "these are coming" rather than as one lonely card.
 */
export function UpcomingListCard({
  title,
  note,
  label,
  className = "",
}: {
  title: string;
  note: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex-col rounded-2xl border border-dashed border-fg/10 bg-fg/[0.015] p-5 ${className || "flex"}`}
      aria-disabled="true"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <h3 className="mt-2 flex-1 font-bold leading-snug text-slate-400">{title}</h3>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{note}</p>
    </div>
  );
}
