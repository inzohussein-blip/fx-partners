import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Branded broker-link redirector: `/go/<code>`.
 *
 * Logs the click, then 302s to the real referral URL. Fails open — a logging
 * error never costs the visitor the redirect.
 *
 * The click now also carries the referring agent. A visitor who arrived
 * through `/r/<slug>` is holding an `fxp_ref` cookie; resolving it here is
 * what answers the question a master IB actually needs — which agent drives
 * traffic that reaches a broker — and it was previously unanswerable, because
 * the two tracking paths never met.
 */
export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.redirect(site);

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(url, key);

    const { data: link } = await admin
      .from("broker_links")
      .select("id,broker_id,referral_url")
      .eq("code", params.code)
      .maybeSingle();

    if (!link?.referral_url) return NextResponse.redirect(site);

    const headers = req.headers;
    const country =
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      null;
    const referer = headers.get("referer");

    // Attribute to the agent whose link brought this visitor, if any. An
    // unknown or expired slug simply leaves the click unattributed rather
    // than blocking it.
    const refSlug = cookies().get("fxp_ref")?.value ?? null;
    let ibId: string | null = null;
    if (refSlug) {
      const { data: refLink } = await admin
        .from("referral_links")
        .select("ib_id")
        .eq("slug", refSlug)
        .eq("is_active", true)
        .maybeSingle();
      ibId = (refLink?.ib_id as string | undefined) ?? null;
    }

    // Best-effort click log (never blocks the redirect meaningfully).
    admin
      .from("broker_link_clicks")
      .insert({
        link_id: link.id,
        broker_id: link.broker_id,
        country,
        referer: referer ? referer.slice(0, 300) : null,
        ib_id: ibId,
        ref_slug: refSlug,
      })
      .then(() => {});

    return NextResponse.redirect(link.referral_url, 302);
  } catch {
    return NextResponse.redirect(site);
  }
}
