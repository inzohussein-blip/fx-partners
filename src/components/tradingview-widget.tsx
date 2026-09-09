"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Generic embedder for TradingView's free external widgets (economic
 * calendar, news timeline, ticker tape, …).
 *
 * The embed is a blocking third-party script that pulls its own JS, fonts and
 * iframe, so it is DEFERRED twice over:
 *   1. it is only armed once the container scrolls into view, and
 *   2. once armed it waits for browser idle (or the visitor's first
 *      interaction), so it never competes with the hero for LCP.
 * The container reserves its final height up front, so deferring costs no
 * layout shift.
 */
export function TradingViewWidget({
  scriptSrc,
  config,
  height = 500,
}: {
  scriptSrc: string;
  config: Record<string, unknown>;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  // 1) Arm only when the widget is near the viewport, then wait for idle or
  //    the first real interaction — whichever comes first.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let idleId: number | undefined;
    let timerId: number | undefined;
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

    const fire = () => {
      cleanupWaiters();
      setArmed(true);
    };
    const cleanupWaiters = () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) window.clearTimeout(timerId);
      events.forEach((e) => window.removeEventListener(e, fire));
    };

    const arm = () => {
      events.forEach((e) => window.addEventListener(e, fire, { once: true, passive: true }));
      const ric = (window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }).requestIdleCallback;
      if (ric) idleId = ric(fire, { timeout: 3000 });
      else timerId = window.setTimeout(fire, 1500);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          arm();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cleanupWaiters();
    };
  }, []);

  // 2) Inject the embed once armed.
  useEffect(() => {
    if (!armed) return;
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = `${height}px`;
    widget.style.width = "100%";
    container.appendChild(widget);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span>Track all markets on TradingView</span></a>';
    container.appendChild(copyright);

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, scriptSrc, height, JSON.stringify(config)]);

  return (
    <div
      ref={ref}
      className="tradingview-widget-container"
      // Reserve the space so the deferred load causes no layout shift.
      style={{ width: "100%", minHeight: height }}
    />
  );
}
