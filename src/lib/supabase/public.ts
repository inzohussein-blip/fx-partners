import { createServerClient } from "@supabase/ssr";

/**
 * A Supabase client for public, cookie-free reads.
 *
 * The normal server client reads the auth cookies via next/headers, which
 * opts the caller into dynamic rendering. Routes that only ever read public
 * (anon-visible) data — the sitemap is the first — do not need the session,
 * and reading it would keep them from being cached. This client hands the SDK
 * an empty cookie store so it never touches next/headers, leaving the route
 * free to set `revalidate`.
 */
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* read-only: nothing to persist */
        },
      },
    }
  );
}
