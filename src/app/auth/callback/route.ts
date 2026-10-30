import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-redirect";
import { authErrorKey, type CallbackReason } from "@/lib/auth-errors";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Lands every link Supabase Auth sends back to the site — email
 * confirmation, password recovery, Google sign-in — and turns it into a
 * session, then redirects to `next`.
 *
 * Two link shapes are accepted: `?code=` (the PKCE flow the default email
 * templates and OAuth use) and `?token_hash=&type=` (templates that link
 * here directly). When Supabase itself reports a problem it sends
 * `?error_code=`; that and any exchange failure go back to the login page
 * with a reason it can explain, instead of a bare "error".
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeInternalPath(searchParams.get("next"));
  const loginPath = next.startsWith("/en/") || next === "/en" ? "/en/login" : "/login";
  const back = (reason: CallbackReason) =>
    NextResponse.redirect(`${origin}${loginPath}?error=${reason}`);

  const reported = searchParams.get("error_code") ?? searchParams.get("error");
  if (reported) return back(reasonFor({ code: reported, message: searchParams.get("error_description") ?? "" }));

  const supabase = createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  let error: unknown = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else {
    return back("callback");
  }
  if (error) return back(reasonFor(error));

  // Referral attribution (best-effort; never blocks the redirect).
  const cookieStore = await cookies();
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

  // A recovery link always continues to the new-password form.
  return NextResponse.redirect(`${origin}${type === "recovery" ? "/reset-password" : next}`);
}

function reasonFor(error: unknown): CallbackReason {
  const key = authErrorKey(error);
  return key === "linkExpired" || key === "otherBrowser" || key === "providerDisabled" || key === "signupDisabled"
    ? key
    : "callback";
}
