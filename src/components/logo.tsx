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
        {/* Body ribbons — deep gradient for a 3D tube look */}
        <linearGradient id="fx-body-a" x1="9" y1="12" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="0.55" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="fx-body-b" x1="35" y1="12" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        {/* Spherical heads — radial highlight → shadow */}
        <radialGradient id="fx-head-a" cx="0.35" cy="0.3" r="0.85">
          <stop stopColor="#bfdbfe" />
          <stop offset="0.45" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id="fx-head-b" cx="0.35" cy="0.3" r="0.85">
          <stop stopColor="#cffafe" />
          <stop offset="0.45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </radialGradient>
        {/* Soft drop shadow for depth */}
        <filter id="fx-shadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="1.1" stdDeviation="1.1" floodColor="#020617" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#fx-shadow)">
        {/* right figure body (behind) */}
        <path
          d="M22 37 C 32 37 36 28 32 19 C 30 14 26 11 22 11"
          stroke="url(#fx-body-b)"
          strokeWidth="6.4"
          strokeLinecap="round"
        />
        <path
          d="M22 37 C 32 37 36 28 32 19 C 30 14 26 11 22 11"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* left figure body (front) */}
        <path
          d="M22 37 C 12 37 8 28 12 19 C 14 14 18 11 22 11"
          stroke="url(#fx-body-a)"
          strokeWidth="6.4"
          strokeLinecap="round"
        />
        <path
          d="M22 37 C 12 37 8 28 12 19 C 14 14 18 11 22 11"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* heads as glossy spheres */}
        <circle cx="28.5" cy="9.2" r="4.6" fill="url(#fx-head-b)" />
        <ellipse cx="27" cy="7.6" rx="1.5" ry="1" fill="#ffffff" opacity="0.6" />
        <circle cx="15.5" cy="9.6" r="4.6" fill="url(#fx-head-a)" />
        <ellipse cx="14" cy="8" rx="1.5" ry="1" fill="#ffffff" opacity="0.55" />
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
      <span className="text-lg font-bold tracking-tight text-white">
        <span className="bg-brand-gradient bg-clip-text text-transparent">FX</span>{" "}
        Partners
      </span>
    </span>
  );
}
