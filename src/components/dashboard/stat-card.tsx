import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  /** Optional change indicator, e.g. { value: "+12%", dir: "up" }. */
  trend?: { value: string; dir: "up" | "down" };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-surface group p-3.5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30 sm:p-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 sm:text-sm">{label}</span>
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20 sm:h-9 sm:w-9">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-3">
        <span className="text-lg font-bold text-white sm:text-2xl">{value}</span>
        {trend && (
          <span
            dir="ltr"
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              trend.dir === "up"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-rose-500/10 text-rose-300"
            )}
          >
            {trend.dir === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">{hint}</div>}
    </div>
  );
}
