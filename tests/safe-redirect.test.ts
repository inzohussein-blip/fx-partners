import { describe, it, expect } from "vitest";
import { safeInternalPath } from "@/lib/safe-redirect";

describe("safeInternalPath", () => {
  it.each(["/dashboard", "/dashboard/admin?tab=1", "/en/forum", "/reset-password"])(
    "keeps the internal path %s",
    (p) => expect(safeInternalPath(p)).toBe(p),
  );

  it.each([
    "@evil.com",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/\tevil",
    "",
    null,
    undefined,
  ])("rejects %s", (p) => expect(safeInternalPath(p as string)).toBe("/dashboard"));

  it("uses the given fallback", () => {
    expect(safeInternalPath("https://evil.com", "/")).toBe("/");
  });
});
