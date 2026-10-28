"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useAllowed } from "@/components/consent/provider";

/**
 * Vercel Analytics and Speed Insights, behind consent.
 *
 * Even cookieless analytics processes the visitor's IP address and user agent
 * to build its measurements, which is processing of personal data — so for a
 * visitor in the EU or UK it needs a lawful basis, and consent is the one this
 * site relies on. Nothing loads until they say yes.
 */
export function GatedAnalytics() {
  const allowed = useAllowed("analytics");
  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
