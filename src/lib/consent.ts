/**
 * Cookie and tracking consent.
 *
 * This site does three things that need permission before they happen, not
 * after: it sets a 30-day referral-attribution cookie, it loads analytics, and
 * it embeds third-party widgets (TradingView, Binance, a currency API) that
 * receive the visitor's IP address simply by being loaded. Under the ePrivacy
 * Directive and GDPR — which reach any visitor in the EU or UK regardless of
 * where the site is hosted — all three require prior, informed, freely given
 * consent, and refusing has to be as easy as accepting.
 *
 * Consent is kept in a first-party cookie rather than only in localStorage so
 * the server can read it too: the referral redirect has to decide whether to
 * set its cookie before any client code runs.
 */

export const CONSENT_COOKIE = "fxp_consent";

/** How long a recorded choice stands before we ask again. */
export const CONSENT_MAX_AGE_DAYS = 180;

/**
 * The categories a visitor decides on.
 *
 * `necessary` is not a choice and is never stored as one — it covers the
 * sign-in session, the security cookies, the saved theme and the consent
 * record itself, none of which the site can drop without breaking something
 * the visitor asked for.
 */
export const CATEGORIES = ["analytics", "marketing", "external"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Consent = Record<Category, boolean>;

export const DENY_ALL: Consent = { analytics: false, marketing: false, external: false };
export const ALLOW_ALL: Consent = { analytics: true, marketing: true, external: true };

/**
 * Serialised as a short fixed-order string ("1-0-1") rather than JSON: it goes
 * in a cookie on every request, and it is readable in a browser's own cookie
 * inspector, which matters for a record the visitor is entitled to check.
 */
export function serialise(c: Consent): string {
  return CATEGORIES.map((k) => (c[k] ? "1" : "0")).join("-");
}

export function parse(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  const parts = raw.split("-");
  if (parts.length !== CATEGORIES.length) return null;
  if (!parts.every((p) => p === "0" || p === "1")) return null;
  const out = { ...DENY_ALL };
  CATEGORIES.forEach((k, i) => {
    out[k] = parts[i] === "1";
  });
  return out;
}

/**
 * What to assume before the visitor has answered.
 *
 * Nothing. A pre-ticked box or an "accept by continuing to browse" default is
 * not consent, so an unanswered banner denies everything until it is answered.
 */
export function effective(c: Consent | null): Consent {
  return c ?? DENY_ALL;
}
