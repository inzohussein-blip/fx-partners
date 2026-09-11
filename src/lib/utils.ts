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
 * Resolve the canonical site URL — the host every canonical, hreflang,
 * sitemap entry, JSON-LD @id and OG image is built from.
 *
 * The order matters more than it looks. NEXT_PUBLIC_VERCEL_URL is unique to a
 * single *deployment* (fx-partners-a2c894afj-….vercel.app) and is replaced on
 * the next push, so preferring it in production means publishing canonicals
 * that point at a URL which stops existing, listing a sitemap on a host Google
 * is not crawling, and giving the site a new structured-data identity every
 * deploy. The stable production domain is therefore preferred whenever this is
 * a production build; the per-deployment URL is only right for a preview,
 * where it is genuinely the address being viewed.
 *
 * Also handles NEXT_PUBLIC_SITE_URL being DEFINED BUT EMPTY (a common Vercel
 * slip, which would crash `new URL("")`) and a value missing its protocol.
 */
export function getSiteUrl(): string {
  const withProtocol = (v: string) => (v.startsWith("http") ? v : `https://${v}`);

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return withProtocol(explicit);

  // Vercel's stable production domain, exposed alongside NEXT_PUBLIC_VERCEL_URL
  // when system environment variables are enabled for the project.
  const productionHost =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  if (isProduction && productionHost) return withProtocol(productionHost);

  const deployment = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (deployment) return withProtocol(deployment);

  // Last resort before localhost: a production build with no site URL at all
  // still gets a stable host rather than an ephemeral one.
  if (productionHost) return withProtocol(productionHost);

  return "http://localhost:3000";
}
