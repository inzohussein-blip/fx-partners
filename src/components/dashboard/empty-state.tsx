import type { LucideIcon } from "lucide-react";

/**
 * Consistent empty state: a soft icon medallion, a title, an optional
 * description, and an optional action — used wherever a list/table/panel has
 * no data yet, instead of a bare line of muted text.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
