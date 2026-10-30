import { describe, it, expect, vi, beforeEach } from "vitest";

const exchange = vi.fn();
const verify = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { exchangeCodeForSession: exchange, verifyOtp: verify, getUser: async () => ({ data: { user: null } }) },
    rpc: vi.fn(),
  }),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, delete: vi.fn() }) }));

import { GET } from "@/app/auth/callback/route";

const go = async (qs: string) => (await GET(new Request(`https://partners-fx.trade/auth/callback?${qs}`))).headers.get("location");

describe("/auth/callback", () => {
  beforeEach(() => {
    exchange.mockReset().mockResolvedValue({ error: null });
    verify.mockReset().mockResolvedValue({ error: null });
  });

  it("exchanges a code and goes to next", async () => {
    expect(await go("code=abc&next=/dashboard/wallet")).toBe("https://partners-fx.trade/dashboard/wallet");
    expect(exchange).toHaveBeenCalledWith("abc");
  });

  it("verifies a token_hash link", async () => {
    expect(await go("token_hash=h&type=signup")).toBe("https://partners-fx.trade/dashboard");
    expect(verify).toHaveBeenCalledWith({ token_hash: "h", type: "signup" });
  });

  it("sends a recovery link to the new-password form", async () => {
    expect(await go("token_hash=h&type=recovery&next=/dashboard")).toBe("https://partners-fx.trade/reset-password");
  });

  it("explains an expired link reported by Supabase", async () => {
    expect(await go("error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired")).toBe(
      "https://partners-fx.trade/login?error=linkExpired"
    );
  });

  it("explains a link opened in another browser", async () => {
    exchange.mockResolvedValue({ error: { code: "bad_code_verifier", message: "code verifier" } });
    expect(await go("code=abc")).toBe("https://partners-fx.trade/login?error=otherBrowser");
  });

  it("returns English visitors to the English login", async () => {
    exchange.mockResolvedValue({ error: { message: "boom" } });
    expect(await go("code=abc&next=/en/dashboard")).toBe("https://partners-fx.trade/en/login?error=callback");
  });

  it("never redirects off-site", async () => {
    expect(await go("code=abc&next=//evil.com")).toBe("https://partners-fx.trade/dashboard");
  });

  it("rejects a link with nothing to verify", async () => {
    expect(await go("type=signup")).toBe("https://partners-fx.trade/login?error=callback");
  });
});
