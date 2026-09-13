"use client";

import { useEffect, useRef } from "react";

/**
 * Reports a rendered error to the owner.
 *
 * Mounted by the error boundaries, which previously only wrote to the
 * browser console — a place nobody reads on a production deployment, so a
 * page that broke for every visitor could stay broken indefinitely.
 *
 * `keepalive` lets the report survive the visitor immediately navigating away,
 * which is what someone does when a page errors. The ref guard stops React's
 * double-invoked effects in development sending it twice.
 */
export function ErrorReporter({
  error,
  kind = "server",
}: {
  error: Error & { digest?: string };
  kind?: "server" | "client";
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    // Still useful for anyone with devtools open.
    console.error(error);

    try {
      fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: String(error?.message ?? error).slice(0, 500),
          digest: error?.digest,
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
          kind,
        }),
        keepalive: true,
      }).catch(() => {
        /* reporting must never make a broken page worse */
      });
    } catch {
      /* ignore */
    }
  }, [error, kind]);

  return null;
}
