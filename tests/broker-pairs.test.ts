import { describe, it, expect } from "vitest";
import { pairSlug, parsePair } from "@/lib/broker-pairs";

/**
 * A pair must have exactly one URL. If ordering ever stops being canonical,
 * every comparison silently becomes two pages with identical content — the
 * duplicate these pages exist to avoid in the first place.
 */
describe("pairSlug", () => {
  it("orders the pair so both directions produce one URL", () => {
    expect(pairSlug("vantage", "xm")).toBe(pairSlug("xm", "vantage"));
  });

  it("sorts alphabetically", () => {
    expect(pairSlug("xm", "inzo")).toBe("inzo-vs-xm");
  });
});

describe("parsePair", () => {
  it("splits a well-formed pair", () => {
    expect(parsePair("inzo-vs-xm")).toEqual(["inzo", "xm"]);
  });

  it("keeps hyphens inside a broker slug intact", () => {
    // "-vs-" is the separator, not "-", so a hyphenated slug survives.
    expect(parsePair("one-royal-vs-vantage")).toEqual(["one-royal", "vantage"]);
  });

  it("rejects a broker compared with itself", () => {
    expect(parsePair("xm-vs-xm")).toBeNull();
  });

  it("rejects anything that is not a pair", () => {
    expect(parsePair("xm")).toBeNull();
    expect(parsePair("a-vs-b-vs-c")).toBeNull();
    expect(parsePair("-vs-xm")).toBeNull();
  });

  it("round-trips through pairSlug", () => {
    const slug = pairSlug("vantage", "one-royal");
    expect(parsePair(slug)).toEqual(["one-royal", "vantage"]);
  });
});
