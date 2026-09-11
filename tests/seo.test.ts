import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { pageMeta, canonicalUrl, EN_TRANSLATED } from "@/lib/seo";
import { isRated, linkHref } from "@/lib/brokers";

/**
 * Canonicals were once declared on the locale layout. Next inherits metadata
 * down the tree, so every page that did not override it emitted
 * `<link rel="canonical" href="/">` — the whole site telling Google it was a
 * duplicate of the homepage. It rendered perfectly and was invisible until
 * someone read the HTML. These pin the shape of what pageMeta produces.
 */
let saved: string | undefined;

beforeEach(() => {
  saved = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://fxpartners.com";
});
afterEach(() => {
  if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = saved;
});

describe("canonicalUrl", () => {
  it("leaves Arabic unprefixed and prefixes English", () => {
    expect(canonicalUrl("/compare", "ar")).toBe("https://fxpartners.com/compare");
    expect(canonicalUrl("/compare", "en")).toBe("https://fxpartners.com/en/compare");
  });

  it("keeps a trailing slash for the homepage rather than a bare origin", () => {
    expect(canonicalUrl("/", "ar")).toBe("https://fxpartners.com/");
  });
});

describe("pageMeta", () => {
  const meta = (path: string, locale = "ar") =>
    pageMeta({ title: "t", description: "d", path, locale });

  it("gives every page its own canonical, never the homepage's", () => {
    expect(meta("/compare").alternates?.canonical).toBe(
      "https://fxpartners.com/compare"
    );
    expect(meta("/brokers/vantage").alternates?.canonical).toBe(
      "https://fxpartners.com/brokers/vantage"
    );
  });

  it("points the English canonical at the English URL", () => {
    expect(meta("/compare", "en").alternates?.canonical).toBe(
      "https://fxpartners.com/en/compare"
    );
  });

  it("always resolves x-default to the Arabic URL", () => {
    const langs = meta("/tools").alternates?.languages as Record<string, string>;
    expect(langs["x-default"]).toBe("https://fxpartners.com/tools");
    expect(langs.ar).toBe("https://fxpartners.com/tools");
  });

  it("carries the title into the OG and Twitter cards", () => {
    const m = pageMeta({ title: "عنوان", description: "وصف", path: "/offers" });
    expect(m.openGraph?.title).toBe("عنوان");
    expect(m.twitter?.title).toBe("عنوان");
  });
});

describe("untranslated English locale", () => {
  // These describe the deliberate state while EN_TRANSLATED is false: /en is
  // the Arabic page on a second URL, so it must not be offered as an English
  // alternate nor indexed. Flipping the flag flips all of it together.
  it("does not advertise an English alternate", () => {
    const langs = pageMeta({ title: "t", description: "d", path: "/compare" })
      .alternates?.languages as Record<string, string>;
    expect(EN_TRANSLATED).toBe(false);
    expect(langs.en).toBeUndefined();
  });

  it("marks English pages noindex but still followable", () => {
    const m = pageMeta({ title: "t", description: "d", path: "/compare", locale: "en" });
    expect(m.robots).toMatchObject({ index: false, follow: true });
  });

  it("leaves Arabic pages indexable", () => {
    const m = pageMeta({ title: "t", description: "d", path: "/compare", locale: "ar" });
    expect(m.robots).toBeUndefined();
  });
});

describe("isRated", () => {
  // A broker with no reviews stores rating 0. Printing "0.0 ★" reads as a bad
  // score rather than "not rated yet" — the opposite of the truth, on a page
  // traders act on.
  it("is false until real reviews exist", () => {
    expect(isRated({ rating: 0, reviews_count: 0 })).toBe(false);
    expect(isRated({ rating: 0, reviews_count: 5 })).toBe(false);
    expect(isRated({ rating: 4.2, reviews_count: 0 })).toBe(false);
  });

  it("is true once a broker has both a score and reviews", () => {
    expect(isRated({ rating: 4.2, reviews_count: 5 })).toBe(true);
  });
});

describe("linkHref", () => {
  it("uses the tracked redirect when a link has a code", () => {
    expect(linkHref({ code: "abc1234", referral_url: "https://broker.example" })).toBe(
      "/go/abc1234"
    );
  });

  it("falls back to the raw URL so a codeless link still works", () => {
    expect(linkHref({ code: null, referral_url: "https://broker.example" })).toBe(
      "https://broker.example"
    );
  });
});
