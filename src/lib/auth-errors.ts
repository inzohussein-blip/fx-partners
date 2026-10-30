/**
 * Turn a Supabase Auth error (or a reason passed back from /auth/callback)
 * into a key of the `AuthErrors` message namespace, so visitors read what
 * went wrong in their language instead of "Invalid login credentials".
 *
 * Supabase errors carry a stable `code` (supabase-js 2.x); the message
 * patterns are a fallback for older servers and for errors without one.
 */
export type AuthErrorKey =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "userExists"
  | "weakPassword"
  | "samePassword"
  | "rateLimit"
  | "signupDisabled"
  | "providerDisabled"
  | "linkExpired"
  | "otherBrowser"
  | "network"
  | "callback"
  | "generic";

const BY_CODE: Record<string, AuthErrorKey> = {
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_already_exists: "userExists",
  email_exists: "userExists",
  weak_password: "weakPassword",
  same_password: "samePassword",
  over_email_send_rate_limit: "rateLimit",
  over_request_rate_limit: "rateLimit",
  over_sms_send_rate_limit: "rateLimit",
  signup_disabled: "signupDisabled",
  email_provider_disabled: "signupDisabled",
  provider_disabled: "providerDisabled",
  otp_expired: "linkExpired",
  flow_state_expired: "linkExpired",
  flow_state_not_found: "linkExpired",
  bad_code_verifier: "otherBrowser",
};

const BY_MESSAGE: [RegExp, AuthErrorKey][] = [
  [/invalid login credentials/i, "invalidCredentials"],
  [/email not confirmed/i, "emailNotConfirmed"],
  [/already (been )?registered|already exists/i, "userExists"],
  [/password should|weak password|at least \d+ characters/i, "weakPassword"],
  [/different from the old password/i, "samePassword"],
  [/rate limit|too many requests|you can only request this/i, "rateLimit"],
  [/signups? not allowed|signup.*disabled/i, "signupDisabled"],
  [/unsupported provider|provider is not enabled/i, "providerDisabled"],
  [/expired|invalid or has expired/i, "linkExpired"],
  [/code verifier|code_verifier/i, "otherBrowser"],
  [/failed to fetch|network|load failed/i, "network"],
];

export function authErrorKey(error: unknown): AuthErrorKey {
  if (!error) return "generic";
  const e = error as { code?: unknown; status?: unknown; message?: unknown; name?: unknown };
  if (typeof e.code === "string" && BY_CODE[e.code]) return BY_CODE[e.code];
  if (e.status === 429) return "rateLimit";
  const msg = typeof e.message === "string" ? e.message : typeof error === "string" ? error : "";
  for (const [re, key] of BY_MESSAGE) if (re.test(msg)) return key;
  return "generic";
}

/** Reasons /auth/callback may put in `?error=` on its way back to /login. */
export const CALLBACK_REASONS = ["callback", "linkExpired", "otherBrowser", "providerDisabled", "signupDisabled"] as const;
export type CallbackReason = (typeof CALLBACK_REASONS)[number];

export function callbackReason(value: string | null): CallbackReason | null {
  if (!value) return null;
  if (value === "auth") return "callback"; // the old generic value
  return (CALLBACK_REASONS as readonly string[]).includes(value) ? (value as CallbackReason) : null;
}
