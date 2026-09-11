import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * SEO health check.
 *
 * Every canonical, hreflang, sitemap entry, JSON-LD @id and OG image on the
 * site is built from one string: getSiteUrl(). If that resolves to a
 * per-deployment Vercel URL, all of them point at a host that disappears on
 * the next push — the pages look perfectly correct in the HTML and are still
 * uncrawlable. That failure is invisible without checking, so this endpoint
 * reports the resolved base and which variable produced it.
 *
 * Reports names and booleans only, never values of anything secret.
 */
export function GET() {
  const base = getSiteUrl();

  const explicit = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());
  const productionHost = Boolean(
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim()
  );
  const deployment = Boolean(process.env.NEXT_PUBLIC_VERCEL_URL?.trim());
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? null;

  const source = explicit
    ? "NEXT_PUBLIC_SITE_URL"
    : vercelEnv === "production" && productionHost
      ? "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL"
      : deployment
        ? "NEXT_PUBLIC_VERCEL_URL"
        : productionHost
          ? "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL"
          : "localhost fallback";

  // A per-deployment host is stable enough for a preview and fatal in
  // production, so the warning is scoped to where it actually matters.
  const ephemeral = source === "NEXT_PUBLIC_VERCEL_URL" && vercelEnv === "production";

  return NextResponse.json(
    {
      siteUrl: base,
      source,
      vercelEnv,
      present: {
        NEXT_PUBLIC_SITE_URL: explicit,
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: productionHost,
        NEXT_PUBLIC_VERCEL_URL: deployment,
      },
      stable: !ephemeral,
      ...(ephemeral
        ? {
            diagnosis:
              "الروابط الأساسية (canonical / sitemap / JSON-LD) مبنية على رابط نشر مؤقّت يتغيّر مع كل رفع. أضف NEXT_PUBLIC_SITE_URL بنطاقك الثابت في Vercel وأعد البناء.",
          }
        : {}),
      samples: {
        canonicalHome: base,
        canonicalCompare: `${base}/compare`,
        sitemap: `${base}/sitemap.xml`,
        llms: `${base}/llms.txt`,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
