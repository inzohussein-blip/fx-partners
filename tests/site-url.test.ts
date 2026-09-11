import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * getSiteUrl() decides the host behind every canonical, hreflang, sitemap
 * entry, JSON-LD @id and OG image on the site. It once preferred Vercel's
 * per-deployment URL in production, which published canonicals pointing at a
 * host that stops existing on the next push — invisible in the rendered HTML
 * and fatal to indexing. These lock the precedence down.
 */
const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "NEXT_PUBLIC_VERCEL_URL",
  "NEXT_PUBLIC_VERCEL_ENV",
] as const;

let saved: Record<string, string | undefined>;

async function getSiteUrl() {
  // Re-import per case: the module reads process.env at call time, but the
  // fresh import also guards against anyone caching it later.
  const mod = await import("@/lib/utils");
  return mod.getSiteUrl();
}

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("getSiteUrl", () => {
  it("prefers an explicit site URL over everything else", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fxpartners.com";
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "prod.vercel.app";
    process.env.NEXT_PUBLIC_VERCEL_URL = "deploy-abc123.vercel.app";
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    expect(await getSiteUrl()).toBe("https://fxpartners.com");
  });

  it("adds the protocol when the explicit value omits it", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "fxpartners.com";
    expect(await getSiteUrl()).toBe("https://fxpartners.com");
  });

  it("ignores an explicit value that is defined but empty", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    process.env.NEXT_PUBLIC_VERCEL_URL = "deploy-abc123.vercel.app";
    expect(await getSiteUrl()).toBe("https://deploy-abc123.vercel.app");
  });

  it("uses the stable production domain in production, not the deployment URL", async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "fx-partners.vercel.app";
    process.env.NEXT_PUBLIC_VERCEL_URL = "fx-partners-a2c894afj-xyz.vercel.app";
    expect(await getSiteUrl()).toBe("https://fx-partners.vercel.app");
  });

  it("uses the deployment URL on a preview, where it is the real address", async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = "fx-partners.vercel.app";
    process.env.NEXT_PUBLIC_VERCEL_URL = "fx-partners-pr-9-xyz.vercel.app";
    expect(await getSiteUrl()).toBe("https://fx-partners-pr-9-xyz.vercel.app");
  });

  it("falls back to localhost when nothing is configured", async () => {
    expect(await getSiteUrl()).toBe("http://localhost:3000");
  });
});
