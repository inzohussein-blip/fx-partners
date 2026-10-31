import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const getUser = vi.fn();
const createServerClient = vi.fn(() => ({ auth: { getUser } }));
vi.mock("next-intl/middleware", () => ({ default: () => () => NextResponse.next() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: (...a: unknown[]) => createServerClient(...(a as [])) }));

import { proxy } from "@/proxy";

const req = (path: string, cookie?: string) =>
  new NextRequest(new URL(path, "https://partners-fx.trade"), cookie ? { headers: { cookie } } : undefined);

describe("proxy session check", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    createServerClient.mockClear();
    getUser.mockReset().mockResolvedValue({ data: { user: null } });
  });

  it("does not call Supabase for an anonymous visitor on a public page", async () => {
    await proxy(req("/compare", "NEXT_LOCALE=ar; fx_consent=x"));
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("refreshes the session when an auth cookie is present", async () => {
    await proxy(req("/compare", "sb-abc-auth-token.0=xyz"));
    expect(getUser).toHaveBeenCalledOnce();
  });

  it("still guards the dashboard for a visitor with no cookie", async () => {
    const res = await proxy(req("/en/dashboard/wallet"));
    expect(getUser).toHaveBeenCalledOnce();
    expect(res.headers.get("location")).toBe("https://partners-fx.trade/en/login?redirect=%2Fen%2Fdashboard%2Fwallet");
  });
});
