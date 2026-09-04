"use client";

import { useEffect, useRef } from "react";

/**
 * Generic embedder for TradingView's free external widgets (economic
 * calendar, news timeline, ticker tape, …). Injects the widget's script
 * with its JSON config and keeps the required attribution link.
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

  useEffect(() => {
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
  }, [scriptSrc, height, JSON.stringify(config)]);

  return <div ref={ref} className="tradingview-widget-container" style={{ width: "100%" }} />;
}
