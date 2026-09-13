"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades and lifts its children in when they scroll into view.
 *
 * This used Framer Motion, which is roughly 50kB on top of every public page
 * — for one fade on seven homepage sections. The effect is an opacity and a
 * translate, which IntersectionObserver and a CSS transition do natively, so
 * the library is no longer in the path a phone has to download before the
 * landing page is interactive. (It remains available to the three calculators
 * that genuinely animate, which are dynamically imported and only load when
 * someone opens them.)
 *
 * Two details the library handled that are worth keeping:
 *   - `prefers-reduced-motion` skips the animation entirely rather than
 *     shortening it.
 *   - Content starts visible when there is no JavaScript or no observer
 *     support, so a crawler or an older browser never sees a blank section.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setShown(true);
          io.disconnect(); // once, like the original
        }
      },
      { rootMargin: "-80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(24px)",
        transition: `opacity 500ms ease-out ${delay}s, transform 500ms ease-out ${delay}s`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
