import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/**
 * The contact form relays straight into the owner's Telegram — the same
 * channel that carries booking requests and new-partner alerts. Unlimited,
 * one script makes all of it useless, and nothing about the failure is
 * obvious from the outside.
 */
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows up to the limit then refuses", () => {
    const key = `t-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  it("counts each caller separately", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);
    // One sender being throttled must not lock everyone else out.
    expect(rateLimit(b, opts).ok).toBe(true);
  });

  it("lets the caller back in once the window passes", () => {
    const key = `t-${Math.random()}`;
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("reports how long to wait", () => {
    const key = `t-${Math.random()}`;
    const opts = { limit: 1, windowMs: 60_000 };
    rateLimit(key, opts);
    const blocked = rateLimit(key, opts);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });
});

describe("clientKey", () => {
  it("takes the leftmost forwarded address as the client", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9, 70.41.3.18" });
    expect(clientKey(h, "contact")).toBe("contact:203.0.113.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.4" }), "c")).toBe(
      "c:198.51.100.4"
    );
  });

  it("groups unidentifiable callers rather than exempting them", () => {
    // A missing header must not become an unlimited bypass.
    expect(clientKey(new Headers(), "c")).toBe("c:unknown");
  });

  it("keeps scopes independent", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9" });
    expect(clientKey(h, "contact")).not.toBe(clientKey(h, "err"));
  });
});
