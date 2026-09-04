import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1) Locale routing (adds/strips the /en prefix, sets the locale cookie).
  const response = handleI18n(request);

  // 2) Refresh the Supabase session and copy any auth cookies onto the
  //    i18n response, then guard the dashboard.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Path may be "/dashboard..." (ar) or "/en/dashboard..." (en).
    const path = request.nextUrl.pathname;
    const dashboardMatch = path.match(/^\/(en\/)?dashboard(\/|$)/);
    if (!user && dashboardMatch) {
      const isEn = Boolean(dashboardMatch[1]);
      const url = request.nextUrl.clone();
      url.pathname = isEn ? "/en/login" : "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on everything except API/route-handler utilities, Next internals,
  // and files with an extension. `auth` and `r` are un-localized handlers.
  matcher: ["/((?!api|auth|r|_next|_vercel|.*\\..*).*)"],
};
