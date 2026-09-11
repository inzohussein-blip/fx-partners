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

async function callR(slug = "ib-abc12") {
  const { GET } = await import("@/app/r/[slug]/route");
  return GET(new Request(`https://fxpartners.com/r/${slug}`), { params: { slug } });
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
    // the referral.
    rpcResult = "https://evil.example";
    const res = await callR("ib-xyz99");
    expect(res.headers.get("set-cookie")).toContain("fxp_ref=ib-xyz99");
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
