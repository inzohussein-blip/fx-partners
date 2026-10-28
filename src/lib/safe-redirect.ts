/**
 * A same-site path to send the user to after sign-in, or the fallback.
 *
 * `next` / `redirect` arrive in the query string, so anyone can craft them.
 * Joined onto the origin as `${origin}${next}`, a value of "@evil.com" turns
 * https://partners-fx.trade into https://partners-fx.trade@evil.com — a
 * different host — and router.push() follows an absolute URL anywhere. Only a
 * plain path is accepted: it must start with one "/", and may not start with
 * "//" or "/\" (both read as protocol-relative URLs by browsers).
 */
export function safeInternalPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  // Control characters and backslashes have no place in our paths and are
  // how parsers get tricked into a different host.
  if (/[\u0000-\u001f\\]/.test(v)) return fallback;
  return v;
}
