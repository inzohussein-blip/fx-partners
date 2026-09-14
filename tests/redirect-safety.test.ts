import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * /r/<slug> redirects to a target the *agent* controls. The UI offers a
 * three-item dropdown, but that is a browser-side limit: the insert goes
 * straight to PostgREST and the only policy guarding it checks ownership, not
 * the value. So an agent could point their link anywhere and turn
 * <brand>/r/<slug> into an open redirect on the brand domain — on a site whose
 * entire proposition is that its links can be trusted.
 *
 * Migration 0026 constrains the column; this pins the route's own guard, so
 * neither layer can quietly regress.
 */
let rpcResult: unknown = "/";

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({ rpc: async () => ({ data: rpcResult }) }),
}));

/**
 * `consent` is the raw value of the fxp_consent cookie the visitor arrives
 * with — "analytics-marketing-external", each 0 or 1. Omitted means they have
 * not answered the banner, which is the same as having refused.
 */
async function callR(slug = "ib-abc12", consent?: string) {
  const { GET } = await import("@/app/r/[slug]/route");
  const headers: HeadersInit = consent ? { cookie: `fxp_consent=${consent}` } : {};
  return GET(new Request(`https://fxpartners.com/r/${slug}`, { headers }), {
    params: { slug },
  });
}

beforeEach(() => {
  vi.resetModules();
  rpcResult = "/";
});

describe("/r/<slug> redirect safety", () => {
  it("follows an internal path", async () => {
    rpcResult = "/affiliates";
    const res = await callR();
    expect(res.headers.get("location")).toBe("https://fxpartners.com/affiliates");
  });

  it("refuses an absolute URL to another origin", async () => {
    rpcResult = "https://evil.example/fake-login";
    const res = await callR();
    expect(res.headers.get("location")).toBe("https://fxpartners.com/");
  });

  it("refuses a protocol-relative URL", async () => {
    // "//evil.example" inherits the current scheme and leaves the origin —
    // the case a naive startsWith("/") check lets straight through.
    rpcResult = "//evil.example/fake-login";
    const res = await callR();
    expect(res.headers.get("location")).toBe("https://fxpartners.com/");
  });

  it("refuses a javascript: target", async () => {
    rpcResult = "javascript:alert(1)";
    const res = await callR();
    expect(res.headers.get("location")).toBe("https://fxpartners.com/");
  });

  it("still sets the attribution cookie on a refused target", async () => {
    // The agent's link is still their link; a bad target must not cost them
    // the referral — provided the visitor allowed attribution at all.
    rpcResult = "https://evil.example";
    const res = await callR("ib-xyz99", "0-1-0");
    expect(res.headers.get("set-cookie")).toContain("fxp_ref=ib-xyz99");
  });
});

/**
 * The attribution cookie is a 30-day identifier written for a marketing
 * purpose, so it needs consent before it is set — and silence is not consent.
 * The redirect itself must keep working either way: refusing to be tracked is
 * not a reason to break the link someone clicked.
 */
describe("/r/<slug> attribution consent", () => {
  it("sets no cookie when the visitor has not answered the banner", async () => {
    rpcResult = "/affiliates";
    const res = await callR("ib-xyz99");
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(res.headers.get("location")).toBe("https://fxpartners.com/affiliates");
  });

  it("sets no cookie when the visitor refused everything", async () => {
    rpcResult = "/affiliates";
    const res = await callR("ib-xyz99", "0-0-0");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("sets no cookie when other categories are allowed but marketing is not", async () => {
    rpcResult = "/affiliates";
    const res = await callR("ib-xyz99", "1-0-1");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("sets the cookie once marketing is allowed", async () => {
    rpcResult = "/affiliates";
    const res = await callR("ib-xyz99", "1-1-1");
    expect(res.headers.get("set-cookie")).toContain("fxp_ref=ib-xyz99");
  });

  it("treats a malformed consent cookie as no consent", async () => {
    // A truncated or tampered value must fail closed, not open.
    rpcResult = "/affiliates";
    for (const bad of ["1-1", "yes", "1-1-1-1", "2-1-0", ""]) {
      const res = await callR("ib-xyz99", bad);
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  });
});

describe("escapeTelegram", () => {
  it("neutralises markup from public form input", async () => {
    const { escapeTelegram } = await import("@/lib/telegram");
    expect(escapeTelegram('<b>x</b> & <a href="y">z</a>')).toBe(
      "&lt;b&gt;x&lt;/b&gt; &amp; &lt;a href=&quot;y&quot;&gt;z&lt;/a&gt;".replace(
        /&quot;/g,
        '"'
      )
    );
  });

  it("escapes the ampersand first so entities are not double-built", async () => {
    const { escapeTelegram } = await import("@/lib/telegram");
    expect(escapeTelegram("a & b < c")).toBe("a &amp; b &lt; c");
  });
});
