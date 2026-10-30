import { describe, it, expect } from "vitest";
import { authErrorKey, callbackReason } from "@/lib/auth-errors";
import ar from "../messages/ar.json";
import en from "../messages/en.json";

describe("authErrorKey", () => {
  it.each([
    [{ code: "invalid_credentials" }, "invalidCredentials"],
    [{ code: "email_not_confirmed" }, "emailNotConfirmed"],
    [{ code: "email_exists" }, "userExists"],
    [{ code: "over_email_send_rate_limit" }, "rateLimit"],
    [{ code: "bad_code_verifier" }, "otherBrowser"],
    [{ code: "otp_expired" }, "linkExpired"],
    [{ status: 429, message: "x" }, "rateLimit"],
    [{ message: "Invalid login credentials" }, "invalidCredentials"],
    [{ message: "User already registered" }, "userExists"],
    [{ message: "Password should be at least 6 characters." }, "weakPassword"],
    [{ message: "Unsupported provider: provider is not enabled" }, "providerDisabled"],
    [new TypeError("Failed to fetch"), "network"],
    [{ message: "something new" }, "generic"],
    [null, "generic"],
  ])("%j → %s", (err, key) => expect(authErrorKey(err)).toBe(key));
});

describe("callbackReason", () => {
  it("accepts known reasons and the old generic value only", () => {
    expect(callbackReason("auth")).toBe("callback");
    expect(callbackReason("linkExpired")).toBe("linkExpired");
    expect(callbackReason("<script>")).toBeNull();
    expect(callbackReason(null)).toBeNull();
  });
});

describe("AuthErrors messages", () => {
  it("exist in both languages for every key", () => {
    const keys = Object.keys(ar.AuthErrors);
    expect(Object.keys(en.AuthErrors).sort()).toEqual([...keys].sort());
    for (const k of ["invalidCredentials", "emailNotConfirmed", "userExists", "weakPassword", "samePassword", "rateLimit",
      "signupDisabled", "providerDisabled", "linkExpired", "otherBrowser", "network", "callback", "generic"]) {
      expect(keys).toContain(k);
    }
  });
});
