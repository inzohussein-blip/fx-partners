import { cn } from "@/lib/utils";

/**
 * Partners FX brand mark: two overlapping rings — the agent and the broker —
 * with the shared area lit. Partnership is where the two meet. The cyan ring
 * is the brand gradient; the second ring takes the theme's metal tokens
 * (silver on dark, graphite on light) so it stays visible on both.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pfx-a" x1="8" y1="16" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7BE6F7" />
          <stop offset="0.55" stopColor="#22B8F0" />
          <stop offset="1" stopColor="#0077E6" />
        </linearGradient>
        <linearGradient id="pfx-b" x1="24" y1="16" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: "var(--c-logo-metal-1)" }} />
          <stop offset="1" style={{ stopColor: "var(--c-logo-metal-2)" }} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="32" r="16" stroke="url(#pfx-a)" strokeWidth="5.5" />
      <circle cx="40" cy="32" r="16" stroke="url(#pfx-b)" strokeWidth="5.5" />
      {/* The lens where the rings overlap. */}
      <path d="M32 18.14A16 16 0 0 1 32 45.86A16 16 0 0 1 32 18.14Z" fill="url(#pfx-a)" opacity="0.9" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-8 w-8", markClassName)} />
      <span className="text-lg font-extrabold uppercase tracking-[0.14em] text-silver">
        Partners{" "}
        <span className="logo-fx bg-brand-gradient bg-clip-text text-transparent">FX</span>
      </span>
    </span>
  );
}
