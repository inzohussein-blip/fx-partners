import type { LucideIcon } from "lucide-react";

/**
 * Unified section intro used across marketing sections so every block shares
 * the same rhythm: a brand eyebrow chip, a bold title, and an optional
 * subtitle. Defaults to centered; pass align="start" for split layouts.
 */
export function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`${
        centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-start"
      } ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200">
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
          {eyebrow}
        </span>
      )}
      <h2
        className={`${
          eyebrow ? "mt-5" : ""
        } text-3xl font-bold text-white sm:text-4xl`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 leading-relaxed text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
