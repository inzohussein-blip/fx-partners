import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the email-confirmation / OAuth redirect. Exchanges the `code`
 * for a session, attributes the signup to a referral link if a `fxp_ref`
 * cookie is present, then redirects into the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Referral attribution (best-effort; never blocks the redirect).
      const cookieStore = cookies();
      const ref = cookieStore.get("fxp_ref")?.value;
      if (ref) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          await supabase.rpc("attribute_referral", {
            link_slug: ref,
            client_email: user?.email ?? null,
          });
        } catch {
          // ignore attribution failures
        }
        cookieStore.delete("fxp_ref");
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
