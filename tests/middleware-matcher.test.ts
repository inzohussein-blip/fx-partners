import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/middleware", () => ({ default: () => () => new Response() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

/**
 * The matcher decides which paths get the locale rewrite. Two regressions it
 * once caused, both silent in development: /reset-password 404'd for Arabic
 * visitors (the `r` exclusion meant for /r/<slug> matched any path starting
 * with "r"), and /icon + /apple-icon 404'd, so the site shipped with no
 * favicon.
 */
async function matches(path: string) {
  const { config } = await import("@/middleware");
  return new RegExp(`^${config.matcher[0]}$`).test(path);
}

describe("middleware matcher", () => {
  it.each(["/", "/reset-password", "/en/reset-password", "/brokers/xm", "/compare", "/go-live", "/rates", "/iconic"])(
    "localises %s",
    async (p) => expect(await matches(p)).toBe(true),
  );

  it.each(["/r/abc", "/go/xyz", "/api/public/brokers", "/auth/callback", "/icon", "/apple-icon", "/_next/static/x.js", "/robots.txt", "/sitemap.xml"])(
    "leaves %s alone",
    async (p) => expect(await matches(p)).toBe(false),
  );
});
