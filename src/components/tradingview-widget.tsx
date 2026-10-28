"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useAllowed } from "@/components/consent/provider";
import { ExternalGate } from "@/components/consent/external-gate";
import { tvLocale } from "@/lib/tradingview";

/**
 * Generic embedder for TradingView's free external widgets (economic
 * calendar, news timeline, ticker tape, …).
 *
 * It is CONSENT-GATED first of all: the script, its fonts and its iframe all
 * come from tradingview.com, which learns the visitor's IP address the moment
 * any of them is requested. Nothing is injected until external content has
 * been allowed, and the effects below bail out before observing anything.
 *
 * Beyond that the embed is a blocking third-party script that pulls its own
 * JS, fonts and iframe, so it is DEFERRED twice over:
 *   1. it is only armed once the container scrolls into view, and
 *   2. once armed it waits for browser idle (or the visitor's first
 *      interaction), so it never competes with the hero for LCP.
 * The container reserves its final height up front, so deferring costs no
 * layout shift.
 *
 * Theme and language follow the site: `colorTheme` and `locale` are filled in
 * here (any value passed in config is overridden), and switching the site's
 * theme re-embeds the widget in the matching one.
 */
export function TradingViewWidget(props: {
  scriptSrc: string;
  config: Record<string, unknown>;
  height?: number;
}) {
  return (
    <ExternalGate minHeight={props.height ?? 500}>
      <Embed {...props} />
    </ExternalGate>
  );
}

function Embed({
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
  const allowed = useAllowed("external");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const fullConfig = { ...config, colorTheme: theme, locale: tvLocale(locale) };

  // 1) Arm only when the widget is near the viewport, then wait for idle or
  //    the first real interaction — whichever comes first.
  useEffect(() => {
    if (!allowed) return;
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
  }, [allowed]);

  // 2) Inject the embed once armed.
  useEffect(() => {
    if (!armed || !allowed || !resolvedTheme) return;
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
    script.innerHTML = JSON.stringify(fullConfig);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, allowed, resolvedTheme, scriptSrc, height, JSON.stringify(fullConfig)]);

  return (
    <div
      ref={ref}
      className="tradingview-widget-container"
      // Reserve the space so the deferred load causes no layout shift.
      style={{ width: "100%", minHeight: height }}
    />
  );
}
