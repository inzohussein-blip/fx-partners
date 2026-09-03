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

/**
 * Resolve the canonical site URL. Handles the common Vercel case where
 * NEXT_PUBLIC_SITE_URL is DEFINED BUT EMPTY (which would crash `new URL("")`),
 * a value missing its protocol, and falls back to VERCEL_URL then localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
