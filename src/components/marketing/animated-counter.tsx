"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to a number when scrolled into view (easeOutExpo). Respects
 * prefers-reduced-motion (renders the final value immediately).
 */
export function AnimatedCounter({
  to,
  duration = 1600,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            setValue(ease * to);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  const shown = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} dir="ltr" className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/**
 * Animates the first numeric run inside a formatted stat string, keeping the
 * surrounding prefix/suffix intact (e.g. "$4.6M+" → $ · 4.6 · M+).
 */
export function AnimatedStat({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const m = value.match(/([^0-9.,-]*)([\d.,]+)(.*)/);
  if (!m) return <span className={className}>{value}</span>;

  const [, prefix, numRaw, suffix] = m;
  const decimals = numRaw.includes(".") ? (numRaw.split(".")[1]?.length ?? 0) : 0;
  const to = Number(numRaw.replace(/,/g, ""));
  if (!Number.isFinite(to)) return <span className={className}>{value}</span>;

  return (
    <AnimatedCounter
      to={to}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  );
}
