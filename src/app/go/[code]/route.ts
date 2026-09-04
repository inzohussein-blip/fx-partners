import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Branded broker-link redirector: /go/<code>
 * Logs the click (country + referrer) via the service role, then 302s to the
 * real referral URL. Fails open — always redirects even if logging fails.
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

    // Best-effort click log (never blocks the redirect meaningfully).
    const headers = req.headers;
    const country =
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      null;
    const referer = headers.get("referer");
    admin
      .from("broker_link_clicks")
      .insert({
        link_id: link.id,
        broker_id: link.broker_id,
        country,
        referer: referer ? referer.slice(0, 300) : null,
      })
      .then(() => {});

    return NextResponse.redirect(link.referral_url, 302);
  } catch {
    return NextResponse.redirect(site);
  }
}
