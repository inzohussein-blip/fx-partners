import { describe, it, expect } from "vitest";
import { jsonLdScript } from "@/lib/jsonld";

describe("jsonLdScript", () => {
  it("escapes a </script> break-out attempt", () => {
    const out = jsonLdScript({ name: "Acme</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("\\u003c");
  });

  it("escapes angle brackets and ampersands", () => {
    const out = jsonLdScript({ v: "a<b>c&d" });
    expect(out).not.toMatch(/[<>&]/);
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
    expect(out).toContain("\\u0026");
  });

  it("round-trips back to the original object as JSON", () => {
    const data = { "@type": "Product", name: "One <Royal> & Co" };
    // The escaped < sequences are valid JSON escapes, so parsing restores it.
    expect(JSON.parse(jsonLdScript(data))).toEqual(data);
  });
});
