"use client";

import { useEffect } from "react";
import { useAllowed } from "@/components/consent/provider";

/**
 * Cloudflare Web Analytics, behind consent.
 *
 * Even cookieless analytics processes the visitor's IP address and user agent
 * to build its measurements, which is processing of personal data — so for a
 * visitor in the EU or UK it needs a lawful basis, and consent is the one this
 * site relies on. Nothing loads until they say yes.
 *
 * IMPORTANT: keep "Automatic setup" for Web Analytics OFF in the Cloudflare
 * dashboard (Analytics & Logs → Web Analytics → the site → Manage site).
 * Automatic setup injects the beacon into every page itself, ahead of this
 * component, and would bypass the consent gate.
 *
 * Renders only when NEXT_PUBLIC_CF_ANALYTICS_TOKEN is set.
 */
const TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN?.trim();

export function GatedAnalytics() {
  const allowed = useAllowed("analytics");

  useEffect(() => {
    if (!allowed || !TOKEN) return;
    if (document.querySelector("script[data-cf-beacon]")) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
    document.head.appendChild(s);
  }, [allowed]);

  return null;
}
