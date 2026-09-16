import type { Broker } from "@/lib/brokers";

/**
 * "Best for X" categories.
 *
 * These pages are the highest-intent surface a broker directory has: someone
 * searching "أفضل وسيط للحساب الإسلامي" has already decided what matters to
 * them and only wants the shortlist. Competitors in this niche run the same
 * pages, which is a reason to have them and not a reason to copy how they are
 * built.
 *
 * The discipline that makes them honest: a page titled "best for beginners" is
 * a claim, so every category here is a filter over a column we actually store
 * plus a stated rule for the order. No category is a matter of opinion, none
 * of them is hand-curated, and each page prints the rule it used. A broker
 * appears because its own data puts it there.
 *
 * `qualifies` decides membership. `rank` decides the order within the page —
 * lower sorts first — and is deliberately NOT the star rating for most
 * categories: on a page about minimum deposits, the ordering fact should be
 * the minimum deposit. Rating breaks ties, so an unrated broker never
 * outranks a reviewed one by accident.
 */
export type BestForCategory = {
  /** URL segment, and the key into the `BestFor` message namespace. */
  slug: string;
  /** Does this broker belong on the page at all? */
  qualifies: (b: Broker) => boolean;
  /** Sort key within the page; lower first. */
  rank: (b: Broker) => number;
  /**
   * The one fact that put this broker on this page, shown on its row.
   * Returning null means we hold the fact but cannot express it briefly.
   */
  fact: (b: Broker) => { key: string; value: string } | null;
};

/** Sorts brokers with no value for the ranking column to the end. */
const LAST = Number.POSITIVE_INFINITY;

export const CATEGORIES: BestForCategory[] = [
  {
    slug: "islamic",
    qualifies: (b) => b.swap_free === true,
    // Among swap-free brokers, the cheapest entry comes first: the reader has
    // already filtered on the feature, so cost is what separates them.
    rank: (b) => b.min_deposit ?? LAST,
    fact: (b) =>
      b.min_deposit != null ? { key: "minDeposit", value: `$${b.min_deposit}` } : null,
  },
  {
    slug: "beginners",
    // A low barrier to entry is the one thing a beginner can act on without
    // understanding the rest, so that is the whole criterion — not a guess at
    // which interface is "friendly".
    qualifies: (b) => b.min_deposit != null && b.min_deposit <= 100,
    rank: (b) => b.min_deposit ?? LAST,
    fact: (b) =>
      b.min_deposit != null ? { key: "minDeposit", value: `$${b.min_deposit}` } : null,
  },
  {
    slug: "low-spread",
    qualifies: (b) => b.spread_from != null,
    rank: (b) => b.spread_from ?? LAST,
    fact: (b) =>
      b.spread_from != null ? { key: "spreadFrom", value: String(b.spread_from) } : null,
  },
  {
    slug: "scalping",
    qualifies: (b) => b.allows_scalping === true,
    // Scalping is a cost game before anything else.
    rank: (b) => b.spread_from ?? LAST,
    fact: (b) =>
      b.spread_from != null ? { key: "spreadFrom", value: String(b.spread_from) } : null,
  },
  {
    slug: "automated",
    qualifies: (b) => b.supports_ea === true,
    rank: (b) => b.spread_from ?? LAST,
    fact: (b) =>
      b.spread_from != null ? { key: "spreadFrom", value: String(b.spread_from) } : null,
  },
  {
    slug: "hedging",
    qualifies: (b) => b.allows_hedging === true,
    rank: (b) => b.spread_from ?? LAST,
    fact: (b) =>
      b.spread_from != null ? { key: "spreadFrom", value: String(b.spread_from) } : null,
  },
  {
    slug: "gold",
    qualifies: (b) => b.supports_gold === true,
    rank: (b) => b.spread_from ?? LAST,
    fact: (b) =>
      b.spread_from != null ? { key: "spreadFrom", value: String(b.spread_from) } : null,
  },
  {
    slug: "regulated",
    // Ordered by how many separate regulators we have verified, most first.
    // Negated so the comparator stays "lower is better" like the others.
    qualifies: (b) => (b.licenses?.length ?? 0) > 0,
    rank: (b) => -(b.licenses?.length ?? 0),
    fact: (b) => {
      const n = b.licenses?.length ?? 0;
      return n > 0 ? { key: "licenceCount", value: String(n) } : null;
    },
  },
];

export function categoryBySlug(slug: string): BestForCategory | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/**
 * The brokers that belong on a category page, in order.
 *
 * Ties break on rating and then review count, so a broker with real reviews
 * edges out an unrated one that happens to share its spread. An unrated broker
 * still appears — it qualified on the data — it simply does not jump the queue.
 */
export function selectFor(category: BestForCategory, brokers: Broker[]): Broker[] {
  return brokers
    .filter(category.qualifies)
    .sort((a, b) => {
      const d = category.rank(a) - category.rank(b);
      if (d !== 0) return d;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews_count - a.reviews_count;
    });
}

/**
 * Categories that have something to show, with their winner.
 *
 * A category with no qualifying broker is not rendered anywhere — no empty
 * page, no link to one, and no entry in the sitemap. The site would otherwise
 * publish "best broker for scalping" over an empty list, which is a promise
 * made to a search engine and broken for the reader who follows it.
 */
export function populatedCategories(
  brokers: Broker[]
): { category: BestForCategory; brokers: Broker[] }[] {
  return CATEGORIES.map((category) => ({ category, brokers: selectFor(category, brokers) })).filter(
    (x) => x.brokers.length > 0
  );
}
