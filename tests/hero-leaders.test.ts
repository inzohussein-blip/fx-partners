import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (k: string) => k }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));

import { pickLeaders, type LeaderRow } from "@/components/marketing/hero-leaderboard";
import { shouldShowRanking } from "@/components/brokers/broker-ranking";
import type { Broker } from "@/lib/brokers";

const row = (slug: string, o: Partial<LeaderRow> = {}): LeaderRow => ({
  name: slug, slug, logo_url: null, rating: 0, reviews_count: 0, licenses: [], ...o,
});

describe("hero leaderboard rows", () => {
  it("ranks by verified regulators while nobody is rated", () => {
    const out = pickLeaders([
      row("a", { licenses: ["fsa"] }),
      row("b", { licenses: ["fca", "asic", "fsca"] }),
      row("c"),
      row("d", { licenses: ["cysec", "asic"] }),
    ]);
    expect(out.map((r) => r.slug)).toEqual(["b", "d", "a"]);
  });

  it("ignores licence codes the site does not recognise", () => {
    expect(pickLeaders([row("x", { licenses: ["made-up"] })])).toEqual([]);
  });

  it("switches to real ratings as soon as one exists", () => {
    const out = pickLeaders([
      row("licensed", { licenses: ["fca", "asic", "fsca"] }),
      row("rated", { rating: 4.2, reviews_count: 3 }),
    ]);
    expect(out.map((r) => r.slug)).toEqual(["rated"]);
  });
});

describe("ranking sidebar", () => {
  const b = (rating: number, reviews_count: number) => ({ rating, reviews_count }) as Broker;
  it("stays hidden while fewer than three brokers are rated", () => {
    expect(shouldShowRanking([b(0, 0), b(0, 0), b(0, 0), b(4, 2)])).toBe(false);
  });
  it("shows once three are rated", () => {
    expect(shouldShowRanking([b(4, 1), b(3, 2), b(5, 1)])).toBe(true);
  });
});
