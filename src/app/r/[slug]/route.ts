import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Referral redirect + click tracker.
 * `/r/<slug>` increments the link's click counter (via a SECURITY DEFINER
 * RPC, since the visitor is anonymous), drops a `fxp_ref` cookie for signup
 * attribution, then redirects to the link's target page.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const origin = new URL(request.url).origin;
  let dest = "/";

  try {
    const supabase = createClient();
    const { data } = await supabase.rpc("track_referral_click", {
      link_slug: params.slug,
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
