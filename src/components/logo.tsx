import { cn } from "@/lib/utils";

/**
 * FX Partners brand mark — two figures rising together (the "partners"
 * emblem) rendered as a blue→cyan gradient, matching the brand identity.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="fx-mark-a"
          x1="8"
          y1="8"
          x2="24"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id="fx-mark-b"
          x1="36"
          y1="8"
          x2="20"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* left figure body */}
      <path
        d="M22 37 C 12 37 8 28 12 19 C 14 14 18 11 22 11"
        stroke="url(#fx-mark-a)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* right figure body */}
      <path
        d="M22 37 C 32 37 36 28 32 19 C 30 14 26 11 22 11"
        stroke="url(#fx-mark-b)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* heads */}
      <circle cx="15.5" cy="9.5" r="4.2" fill="url(#fx-mark-a)" />
      <circle cx="28.5" cy="9.5" r="4.2" fill="url(#fx-mark-b)" />
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
      <span className="text-lg font-bold tracking-tight text-white">
        <span className="bg-brand-gradient bg-clip-text text-transparent">FX</span>{" "}
        Partners
      </span>
    </span>
  );
}
