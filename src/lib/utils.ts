import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency. */
export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

/** Format a compact number (1.2K, 3.4M). */
export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value ?? 0);
}

/** The production domain. Used when a production build has no NEXT_PUBLIC_SITE_URL. */
export const PRODUCTION_SITE_URL = "https://partners-fx.trade";

/**
 * Resolve the canonical site URL — the host every canonical, hreflang,
 * sitemap entry, JSON-LD @id and OG image is built from.
 *
 * NEXT_PUBLIC_SITE_URL wins when set (and non-empty; a missing protocol is
 * added). A production build without it falls back to the production domain
 * rather than localhost, so a forgotten variable cannot publish canonicals
 * that point at a developer's machine. Anything else is local development.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  return "http://localhost:3000";
}
