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
        "card-surface group p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-brand-500/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20 transition group-hover:bg-brand-500/20">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
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
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
