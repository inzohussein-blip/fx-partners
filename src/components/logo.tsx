import { cn } from "@/lib/utils";

/**
 * FX Partners brand mark — a metallic "P" ribbon: a silver upper form melting
 * into electric-cyan → bright-blue, per the Partners FX visual identity.
 * Rendered with a diagonal metallic gradient, a specular highlight edge, and
 * a soft drop shadow for a premium 3D feel.
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
        {/* Metallic sweep: bright silver (top-left) → electric cyan → blue */}
        <linearGradient id="fx-metal" x1="8" y1="6" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5F7FA" />
          <stop offset="0.32" stopColor="#C0CACC" />
          <stop offset="0.62" stopColor="#00D1E6" />
          <stop offset="1" stopColor="#008CFF" />
        </linearGradient>
        <filter id="fx-shadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="1.1" stdDeviation="1.1" floodColor="#020617" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#fx-shadow)">
        {/* Stem of the P */}
        <path
          d="M14.5 8 V37"
          stroke="url(#fx-metal)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Bowl of the P (D-shaped loop to the right) */}
        <path
          d="M14.5 8 H23 A9.5 9.5 0 0 1 23 27 H14.5"
          stroke="url(#fx-metal)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Specular highlight along the upper-left edge for a metallic sheen */}
        <path
          d="M14.5 9 V20"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M15.5 8.5 H22.5 A8 8 0 0 1 26.5 12"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </g>
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
        <span className="bg-brand-gradient bg-clip-text text-transparent">FX</span>{" "}
        Partners
      </span>
    </span>
  );
}
