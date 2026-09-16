import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  categoryBySlug,
  populatedCategories,
  selectFor,
} from "@/lib/best-for";
import type { Broker } from "@/lib/brokers";

/**
 * A "best for X" page is a published claim about real companies, so the thing
 * worth pinning is not that the code runs — it is that a broker can only be on
 * a list its own data puts it on, and that the order is the stated rule rather
 * than whatever the database happened to return.
 */
function broker(over: Partial<Broker> = {}): Broker {
  return {
    id: Math.random().toString(36).slice(2),
    slug: "b",
    name: "B",
    logo_url: null,
    status: "not_partnered",
    deposit_bonus: null,
    welcome_bonus: null,
    description: null,
    rating: 0,
    reviews_count: 0,
    ...over,
  } as Broker;
}

describe("category membership", () => {
  it("includes a broker only when the column says so", () => {
    const islamic = categoryBySlug("islamic")!;
    const yes = broker({ swap_free: true, min_deposit: 50 });
    const no = broker({ swap_free: false, min_deposit: 10 });
    const unknown = broker({ min_deposit: 1 });

    const picked = selectFor(islamic, [yes, no, unknown]);
    expect(picked).toHaveLength(1);
    expect(picked[0]).toBe(yes);
  });

  it("never guesses a missing value into qualifying", () => {
    // A broker with no min_deposit is not "cheap by default" — it is unknown,
    // and an unknown must not be published as a beginner recommendation.
    const beginners = categoryBySlug("beginners")!;
    expect(selectFor(beginners, [broker({}), broker({ min_deposit: null })])).toHaveLength(0);
  });

  it("puts the beginner cutoff at $100 inclusive", () => {
    const beginners = categoryBySlug("beginners")!;
    const inList = selectFor(beginners, [
      broker({ min_deposit: 100 }),
      broker({ min_deposit: 101 }),
    ]);
    expect(inList).toHaveLength(1);
    expect(inList[0].min_deposit).toBe(100);
  });
});

describe("ordering", () => {
  it("ranks by the category's own rule, not by rating", () => {
    // The whole point of these pages: on a spread page, the cheapest spread
    // leads even when a worse-priced broker has the better stars.
    const lowSpread = categoryBySlug("low-spread")!;
    const cheap = broker({ name: "Cheap", spread_from: 0.1, rating: 1, reviews_count: 3 });
    const starry = broker({ name: "Starry", spread_from: 2.0, rating: 5, reviews_count: 99 });
    expect(selectFor(lowSpread, [starry, cheap]).map((b) => b.name)).toEqual([
      "Cheap",
      "Starry",
    ]);
  });

  it("breaks a tie on rating, then on review count", () => {
    const lowSpread = categoryBySlug("low-spread")!;
    const rated = broker({ name: "Rated", spread_from: 1, rating: 4.5, reviews_count: 2 });
    const unrated = broker({ name: "Unrated", spread_from: 1, rating: 0, reviews_count: 0 });
    const busier = broker({ name: "Busier", spread_from: 1, rating: 4.5, reviews_count: 50 });
    expect(selectFor(lowSpread, [unrated, rated, busier]).map((b) => b.name)).toEqual([
      "Busier",
      "Rated",
      "Unrated",
    ]);
  });

  it("sorts a qualifying broker with no ranking value to the end", () => {
    // It permits scalping, so it belongs on the page; we just cannot say where
    // it sits on cost, and an unknown must not lead the list.
    const scalping = categoryBySlug("scalping")!;
    const known = broker({ name: "Known", allows_scalping: true, spread_from: 0.5 });
    const blank = broker({ name: "Blank", allows_scalping: true });
    expect(selectFor(scalping, [blank, known]).map((b) => b.name)).toEqual(["Known", "Blank"]);
  });

  it("puts the most regulated first", () => {
    const regulated = categoryBySlug("regulated")!;
    const one = broker({ name: "One", licenses: ["fca"] });
    const three = broker({ name: "Three", licenses: ["fca", "cysec", "asic"] });
    expect(selectFor(regulated, [one, three]).map((b) => b.name)).toEqual(["Three", "One"]);
  });
});

describe("empty categories", () => {
  it("publishes no list that nothing qualifies for", () => {
    // The page 404s when empty, so a category surfacing here would be a link
    // to a known 404 — in the sitemap, on the homepage and on every list page.
    expect(populatedCategories([])).toEqual([]);
  });

  it("drops only the unpopulated ones", () => {
    const only = populatedCategories([broker({ swap_free: true, min_deposit: 25 })]);
    const slugs = only.map((x) => x.category.slug);
    expect(slugs).toContain("islamic");
    expect(slugs).toContain("beginners");
    expect(slugs).not.toContain("gold");
    expect(slugs).not.toContain("regulated");
  });
});

describe("taxonomy", () => {
  it("has a unique slug per category", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("returns null for a slug outside the taxonomy", () => {
    // The page 404s on this, rather than rendering "best for" whatever was typed.
    expect(categoryBySlug("../../etc/passwd")).toBeNull();
    expect(categoryBySlug("")).toBeNull();
  });
});
