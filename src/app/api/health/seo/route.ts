import { NextResponse } from "next/server";
import { getSiteUrl, PRODUCTION_SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * SEO health check: reports the base URL every canonical, sitemap entry,
 * JSON-LD @id and OG image is built from, and which setting produced it.
 * A wrong base looks correct in the HTML and is still uncrawlable, so this
 * makes it visible. Reports names and booleans only.
 */
export function GET() {
  const base = getSiteUrl();
  const explicit = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());
  const production = process.env.NODE_ENV === "production";
  const source = explicit
    ? "NEXT_PUBLIC_SITE_URL"
    : production
      ? "production default"
      : "localhost fallback";

  return NextResponse.json(
    {
      siteUrl: base,
      source,
      present: { NEXT_PUBLIC_SITE_URL: explicit },
      ...(!explicit && production
        ? {
            diagnosis: `NEXT_PUBLIC_SITE_URL غير مضبوط في بيئة البناء؛ يُستخدم ${PRODUCTION_SITE_URL}. اضبطه صراحةً وأعد البناء إن كان النطاق مختلفاً.`,
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
