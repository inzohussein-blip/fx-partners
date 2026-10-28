import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * getSiteUrl() decides the host behind every canonical, hreflang, sitemap
 * entry, JSON-LD @id and OG image. These lock its precedence down.
 */
let saved: string | undefined;

async function getSiteUrl() {
  const mod = await import("@/lib/utils");
  return mod.getSiteUrl();
}

beforeEach(() => {
  saved = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

afterEach(() => {
  vi.unstubAllEnvs();
  if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = saved;
});

describe("getSiteUrl", () => {
  it("uses an explicit site URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://partners-fx.trade";
    expect(await getSiteUrl()).toBe("https://partners-fx.trade");
  });

  it("adds the protocol when the explicit value omits it", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "partners-fx.trade";
    expect(await getSiteUrl()).toBe("https://partners-fx.trade");
  });

  it("ignores an explicit value that is defined but empty", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    vi.stubEnv("NODE_ENV", "production");
    expect(await getSiteUrl()).toBe("https://partners-fx.trade");
  });

  it("falls back to the production domain in a production build, never localhost", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await getSiteUrl()).toBe("https://partners-fx.trade");
  });

  it("uses localhost in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(await getSiteUrl()).toBe("http://localhost:3000");
  });
});
