/**
 * Hero globe — a glowing wireframe "network" sphere rendered as inline SVG.
 *
 * It sits *behind* the comparison card in the hero, so the card overlaps it the
 * way the devices overlap the globe in the approved Partners FX visual. Pure
 * SVG/CSS: no image asset, no layout shift, and it stays statically rendered.
 */
export function HeroGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      {/* Atmospheric halo */}
      <div
        className="absolute inset-[-14%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,144,252,0.30) 0%, rgba(0,60,120,0.16) 42%, transparent 68%)",
        }}
      />
      <svg viewBox="0 0 520 520" className="relative h-full w-full">
        <defs>
          <radialGradient id="fxg-sphere" cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#0b4a80" />
            <stop offset="42%" stopColor="#052a4c" />
            <stop offset="78%" stopColor="#02152a" />
            <stop offset="100%" stopColor="#010c17" />
          </radialGradient>
          <filter id="fxg-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="fxg-glow-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="11" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(260,260)">
          <circle r="196" fill="url(#fxg-sphere)" />

          {/* Latitudes */}
          <g fill="none" stroke="#2BA8FF" strokeWidth="1">
            <ellipse cx="0" cy="-140" rx="137" ry="30" opacity=".34" />
            <ellipse cx="0" cy="-78" rx="180" ry="40" opacity=".40" />
            <ellipse cx="0" cy="0" rx="196" ry="46" opacity=".46" />
            <ellipse cx="0" cy="78" rx="180" ry="40" opacity=".40" />
            <ellipse cx="0" cy="140" rx="137" ry="30" opacity=".34" />
          </g>

          {/* Meridians */}
          <g fill="none" stroke="#2BA8FF" strokeWidth="1">
            <ellipse rx="196" ry="196" opacity=".30" />
            <ellipse rx="150" ry="196" opacity=".26" />
            <ellipse rx="96" ry="196" opacity=".24" />
            <ellipse rx="38" ry="196" opacity=".22" />
          </g>

          {/* Network links */}
          <g stroke="#54D8F0" strokeWidth="1.1" opacity=".75" filter="url(#fxg-glow)" fill="none">
            <path d="M-120,-60 L-40,-96 L46,-58" />
            <path d="M-40,-96 L20,-10 L110,-40" />
            <path d="M20,-10 L-30,70 L70,96" />
            <path d="M-30,70 L-130,40" />
          </g>

          {/* Network nodes */}
          <g fill="#8DE6FF" filter="url(#fxg-glow)">
            <circle cx="-120" cy="-60" r="3.4" />
            <circle cx="-40" cy="-96" r="4.2" />
            <circle cx="46" cy="-58" r="3.2" />
            <circle cx="20" cy="-10" r="4.6" />
            <circle cx="110" cy="-40" r="3.2" />
            <circle cx="-30" cy="70" r="4" />
            <circle cx="70" cy="96" r="3.4" />
            <circle cx="-130" cy="40" r="3" />
            <circle cx="150" cy="30" r="2.6" />
            <circle cx="-80" cy="-150" r="2.6" />
          </g>

          {/* Bright rim + highlight arc */}
          <circle
            r="196"
            fill="none"
            stroke="#37B4FF"
            strokeWidth="2"
            opacity=".9"
            filter="url(#fxg-glow-lg)"
          />
          <circle
            r="196"
            fill="none"
            stroke="#BFEBFF"
            strokeWidth="1"
            opacity=".45"
            strokeDasharray="300 940"
            strokeDashoffset="-70"
          />
        </g>
      </svg>
    </div>
  );
}
