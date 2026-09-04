"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Professional, RTL-aware carousel: snapping track, prev/next controls, dot
 * indicators, drag-to-scroll, and optional autoplay. Navigation uses
 * scrollIntoView so it works correctly regardless of RTL scroll quirks.
 */
export function Carousel({
  items,
  slideClass = "basis-[85%] sm:basis-[46%] lg:basis-[31.5%]",
  autoPlayMs,
  className = "",
}: {
  items: React.ReactNode[];
  slideClass?: string;
  autoPlayMs?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const n = items.length;
    const idx = ((i % n) + n) % n;
    slideRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [items.length]);

  // Track the most-centered slide for the dots + arrow state.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        slideRefs.current.forEach((el, i) => {
          if (!el) return;
          const elCenter = el.offsetLeft + el.offsetWidth / 2;
          const d = Math.abs(elCenter - center);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setActive(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  // Autoplay (pauses on hover / pointer down).
  useEffect(() => {
    if (!autoPlayMs) return;
    const track = trackRef.current;
    let paused = false;
    const enter = () => (paused = true);
    const leave = () => (paused = false);
    track?.addEventListener("pointerenter", enter);
    track?.addEventListener("pointerleave", leave);
    track?.addEventListener("pointerdown", enter);
    const id = setInterval(() => {
      if (!paused) setActive((cur) => {
        const next = (cur + 1) % items.length;
        scrollTo(next);
        return next;
      });
    }, autoPlayMs);
    return () => {
      clearInterval(id);
      track?.removeEventListener("pointerenter", enter);
      track?.removeEventListener("pointerleave", leave);
      track?.removeEventListener("pointerdown", enter);
    };
  }, [autoPlayMs, items.length, scrollTo]);

  // Drag-to-scroll.
  const drag = useRef({ down: false, startX: 0, startScroll: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { down: true, startX: e.clientX, startScroll: track.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down || !trackRef.current) return;
    trackRef.current.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  };
  const endDrag = () => (drag.current.down = false);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((node, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`shrink-0 snap-center ${slideClass}`}
          >
            {node}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => scrollTo(active - 1)}
          aria-label="السابق"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-800/60 text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-brand-400" : "w-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(active + 1)}
          aria-label="التالي"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-800/60 text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
