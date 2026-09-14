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

describe("translated English locale", () => {
  /**
   * These three move together, and that is the point of the flag.
   *
   * While /en was the Arabic page on a second URL it had to be kept out of
   * the hreflang cluster and out of the index, because an alternate that
   * promises English and delivers Arabic makes a search engine distrust the
   * whole cluster — the Arabic side included. Now that the copy is translated
   * the same flag opens all three at once: the alternate is advertised, /en is
   * indexable, and the sitemap carries it.
   *
   * The tests are written against the flag rather than against a hard-coded
   * expectation, so whichever way it is set, the three stay consistent with
   * each other and a half-flipped state fails.
   */
  it("advertises an English alternate once translated", () => {
    const langs = pageMeta({ title: "t", description: "d", path: "/compare" })
      .alternates?.languages as Record<string, string>;
    if (EN_TRANSLATED) {
      expect(langs.en).toBe("https://fxpartners.com/en/compare");
    } else {
      expect(langs.en).toBeUndefined();
    }
  });

  it("indexes English pages only when they are a real translation", () => {
    const m = pageMeta({ title: "t", description: "d", path: "/compare", locale: "en" });
    if (EN_TRANSLATED) {
      expect(m.robots).toBeUndefined();
    } else {
      expect(m.robots).toMatchObject({ index: false, follow: true });
    }
  });

  it("always names x-default as the Arabic URL", () => {
    // Arabic is the primary language whichever way the flag is set.
    const langs = pageMeta({ title: "t", description: "d", path: "/compare" })
      .alternates?.languages as Record<string, string>;
    expect(langs["x-default"]).toBe("https://fxpartners.com/compare");
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
