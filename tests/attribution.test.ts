import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The money path.
 *
 *   /r/<slug>  → sets the fxp_ref cookie
 *   /go/<code> → resolves that cookie to an ib_id and stores it on the click
 *   → that ib_id is what credits an agent for the traffic they sent
 *
 * If a link in this chain breaks, nothing throws and no page looks wrong —
 * agents simply stop being credited and nobody finds out until someone asks
 * why their numbers are flat. That silence is the reason these exist.
 */

const cookieStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
  }),
}));

/** Rows the fake database answers with, and the inserts it received. */
const db = {
  brokerLink: null as Record<string, unknown> | null,
  refLink: null as Record<string, unknown> | null,
  inserts: [] as Record<string, unknown>[],
};

/**
 * Minimal stand-in for the supabase-js query builder: every filter returns
 * `this`, and the terminal call answers from `db`. Enough to assert what the
 * route sends, without a database.
 */
function makeClient() {
  return {
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => ({
          data: table === "broker_links" ? db.brokerLink : db.refLink,
        }),
        insert(row: Record<string, unknown>) {
          db.inserts.push(row);
          return { then: (fn: () => void) => fn() };
        },
      };
      return builder;
    },
  };
}

vi.mock("@supabase/supabase-js", () => ({ createClient: () => makeClient() }));

async function callGo(code: string) {
  const { GET } = await import("@/app/go/[code]/route");
  return GET(new Request(`https://fxpartners.com/go/${code}`), { params: { code } });
}

beforeEach(() => {
  vi.resetModules();
  cookieStore.clear();
  db.brokerLink = {
    id: "link-1",
    broker_id: "broker-1",
    referral_url: "https://broker.example/signup?p=fx",
  };
  db.refLink = null;
  db.inserts = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  process.env.NEXT_PUBLIC_SITE_URL = "https://fxpartners.com";
});

describe("/go/<code> click attribution", () => {
  it("credits the agent whose referral cookie the visitor carries", async () => {
    cookieStore.set("fxp_ref", "ahmad-telegram");
    db.refLink = { ib_id: "ib-42" };

    const res = await callGo("abc1234");

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://broker.example/signup?p=fx");
    expect(db.inserts).toHaveLength(1);
    expect(db.inserts[0]).toMatchObject({
      link_id: "link-1",
      broker_id: "broker-1",
      ib_id: "ib-42",
      ref_slug: "ahmad-telegram",
    });
  });

  it("still records the click when no agent brought the visitor", async () => {
    const res = await callGo("abc1234");

    expect(res.status).toBe(302);
    expect(db.inserts[0]).toMatchObject({ ib_id: null, ref_slug: null });
  });

  it("leaves the click unattributed when the cookie names a dead link", async () => {
    // Expired campaign, deactivated link, or a slug that never existed: the
    // visitor must still reach the broker.
    cookieStore.set("fxp_ref", "deleted-campaign");
    db.refLink = null;

    const res = await callGo("abc1234");

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://broker.example/signup?p=fx");
    expect(db.inserts[0]).toMatchObject({ ib_id: null, ref_slug: "deleted-campaign" });
  });

  it("records the country and referrer the click arrived with", async () => {
    const { GET } = await import("@/app/go/[code]/route");
    const req = new Request("https://fxpartners.com/go/abc1234", {
      headers: { "x-vercel-ip-country": "IQ", referer: "https://t.me/somechannel" },
    });
    await GET(req, { params: { code: "abc1234" } });

    expect(db.inserts[0]).toMatchObject({
      country: "IQ",
      referer: "https://t.me/somechannel",
    });
  });

  it("sends the visitor home rather than nowhere when the code is unknown", async () => {
    db.brokerLink = null;
    const res = await callGo("does-not-exist");

    expect(res.headers.get("location")).toBe("https://fxpartners.com/");
    expect(db.inserts).toHaveLength(0);
  });
});
