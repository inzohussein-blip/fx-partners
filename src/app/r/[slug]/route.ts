import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const target = dest.startsWith("http")
    ? dest
    : `${origin}${dest.startsWith("/") ? dest : `/${dest}`}`;

  const response = NextResponse.redirect(target);
  response.cookies.set("fxp_ref", params.slug, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
  });
  return response;
}
