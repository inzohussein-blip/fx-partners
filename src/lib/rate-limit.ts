/**
 * Best-effort in-process rate limiting.
 *
 * This is a fixed-window counter held in memory, which on serverless means
 * *per instance*: a request that lands on a cold instance starts a fresh
 * window, so the real ceiling is the configured limit multiplied by however
 * many instances are warm. That is deliberate and worth being clear about —
 * it stops a single script hammering an endpoint, which is the actual threat
 * to a contact form that relays into someone's Telegram, and it costs no
 * dependency and no network call. Enforcing an exact global limit needs
 * shared storage (Redis/Upstash); this is not that.
 *
 * Entries are swept on write, so an idle process does not hold memory.
 */
type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets — for a Retry-After header or a message. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();

  // Sweep expired windows before adding to the map, so a long-lived process
  // does not accumulate a bucket per visitor for ever.
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.resetAt <= now) buckets.delete(k);
    });
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  current.count += 1;
  const retryAfter = Math.ceil((current.resetAt - now) / 1000);
  if (current.count > limit) return { ok: false, remaining: 0, retryAfter };
  return { ok: true, remaining: limit - current.count, retryAfter };
}

/**
 * Caller identity for limiting. Vercel sets x-forwarded-for; the leftmost
 * entry is the client. Falls back to a constant so a missing header limits
 * everyone together rather than letting everyone through unlimited.
 */
export function clientKey(headers: Headers, scope: string): string {
  const fwd = headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
