import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONSENT_COOKIE, effective, parse } from "@/lib/consent";

/**
 * Referral redirect + click tracker: `/r/<slug>`.
 *
 * Records the click through a SECURITY DEFINER RPC — the visitor is anonymous
 * and RLS forbids them writing to these tables — then drops an `fxp_ref`
 * cookie so a later signup, or a click on a broker link, can be attributed to
 * the same agent.
 *
 * The RPC used to bump a lifetime counter and nothing else, which answered
 * "how many clicks ever" and no other question. It now also writes an event
 * row with the country and referrer, so the agent can see when the traffic
 * arrived and where from.
 *
 * The attribution cookie is the part that needs permission. It is a 30-day
 * identifier written for a marketing purpose, so it is set only where the
 * visitor has allowed the marketing category — and a visitor who has not
 * answered the banner yet counts as not having allowed it. The redirect still
 * works and the click is still counted either way: the click row holds a
 * country code and a referrer and no identifier, so it says how much traffic a
 * link sent without following anyone.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const origin = new URL(request.url).origin;
  let dest = "/";

  try {
    const headers = request.headers;
    const country =
      headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || null;
    const referer = headers.get("referer");

    const supabase = createClient();
    const { data } = await supabase.rpc("track_referral_click", {
      link_slug: params.slug,
      p_country: country,
      p_referer: referer ? referer.slice(0, 300) : null,
    });
    if (typeof data === "string" && data) dest = data;
  } catch {
    // fall back to home on any failure
  }

  // Second line of defence behind the database constraint (migration 0026):
  // only ever redirect to a path on this origin. An absolute URL, a
  // protocol-relative "//evil.example", or anything that does not start with a
  // single "/" falls back to the homepage rather than carrying the visitor off
  // the brand domain.
  const safePath = /^\/(?!\/)/.test(dest) ? dest : "/";
  const target = `${origin}${safePath}`;

  const response = NextResponse.redirect(target);

  const consent = effective(parse(request.headers.get("cookie")?.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`)
  )?.[1]));
  if (consent.marketing) {
    response.cookies.set("fxp_ref", params.slug, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });
  }
  return response;
}
