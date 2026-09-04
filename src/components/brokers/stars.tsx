"use client";

import { useState } from "react";
import { Star } from "lucide-react";

/** Read-only star display (supports fractional fill via width clip). */
export function Stars({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div
      className={`relative inline-flex ${className}`}
      dir="ltr"
      aria-label={`${value} من 5`}
    >
      <div className="flex text-slate-700">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} style={{ width: size, height: size }} />
        ))}
      </div>
      <div
        className="absolute inset-0 flex overflow-hidden text-amber-400"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} style={{ width: size, height: size }} fill="currentColor" />
        ))}
      </div>
    </div>
  );
}

/** Interactive star picker (1–5). */
export function StarInput({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex gap-1" dir="ltr" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} نجوم`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition"
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= shown ? "text-amber-400" : "text-slate-600"}
            fill={n <= shown ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
