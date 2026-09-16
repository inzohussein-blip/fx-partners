import { describe, it, expect } from "vitest";
import {
  askableQuestions,
  matchBrokers,
  mostRestrictive,
  QUESTIONS,
} from "@/lib/broker-finder";
import type { Broker } from "@/lib/brokers";

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
  } as unknown as Broker;
}

describe("which questions get asked", () => {
  it("asks nothing of an empty directory", () => {
    expect(askableQuestions([])).toEqual([]);
  });

  it("asks only what the data can answer", () => {
    // Deposit is answerable, platform is not — so offering a platform dropdown
    // would be asking a question we have no basis to answer.
    const ids = askableQuestions([broker({ min_deposit: 100 })]).map((q) => q.id);
    expect(ids).toContain("deposit");
    expect(ids).not.toContain("platform");
    expect(ids).not.toContain("country");
    expect(ids).not.toContain("islamic");
  });

  it("offers only platforms someone actually provides", () => {
    const q = askableQuestions([broker({ platforms: ["mt5"] })]).find(
      (x) => x.id === "platform"
    )!;
    const values = q.options([broker({ platforms: ["mt5"] })]).map((o) => o.value);
    expect(values).toContain("mt5");
    expect(values).not.toContain("mt4");
  });
});

describe("an unknown is never a match", () => {
  it("does not treat a missing minimum deposit as cheap", () => {
    const known = broker({ name: "Known", min_deposit: 25 });
    const unknown = broker({ name: "Unknown" });
    const out = matchBrokers([known, unknown], { deposit: "under-50" });
    expect(out.map((b) => b.name)).toEqual(["Known"]);
  });

  it("does not treat an empty country list as accepting everyone", () => {
    // The dangerous case: telling someone a broker onboards them when all we
    // know is that nobody recorded it.
    const verified = broker({ name: "Verified", accepted_countries: ["IQ"] });
    const blank = broker({ name: "Blank", accepted_countries: [] });
    const out = matchBrokers([verified, blank], { country: "IQ" });
    expect(out.map((b) => b.name)).toEqual(["Verified"]);
  });

  it("does not treat a missing boolean as a yes", () => {
    const yes = broker({ name: "Yes", swap_free: true });
    const missing = broker({ name: "Missing" });
    expect(matchBrokers([yes, missing], { islamic: "yes" }).map((b) => b.name)).toEqual([
      "Yes",
    ]);
  });
});

describe("answers combine", () => {
  const set = [
    broker({ name: "A", min_deposit: 10, swap_free: true, allows_scalping: true, rating: 4 }),
    broker({ name: "B", min_deposit: 10, swap_free: false, allows_scalping: true, rating: 5 }),
    broker({ name: "C", min_deposit: 500, swap_free: true, allows_scalping: true, rating: 5 }),
  ];

  it("narrows on every answered question at once", () => {
    expect(
      matchBrokers(set, { deposit: "under-50", islamic: "yes" }).map((b) => b.name)
    ).toEqual(["A"]);
  });

  it("leaves the set alone for an unanswered question", () => {
    expect(matchBrokers(set, {}).map((b) => b.name)).toEqual(["B", "C", "A"]);
  });

  it("treats 'no preference' as no filter, including for unrecorded values", () => {
    // "Any" must not quietly exclude a broker whose minimum we never recorded.
    const withBlank = [...set, broker({ name: "Blank", swap_free: true })];
    expect(matchBrokers(withBlank, { deposit: "any" }).map((b) => b.name)).toContain("Blank");
  });

  it("ignores an answer that is not a real option", () => {
    // A stale or hand-edited URL should not produce an empty page.
    expect(matchBrokers(set, { deposit: "under-3" })).toHaveLength(3);
  });

  it("orders survivors by rating then review count", () => {
    const out = matchBrokers(
      [
        broker({ name: "Low", rating: 3, reviews_count: 99 }),
        broker({ name: "High", rating: 5, reviews_count: 1 }),
        broker({ name: "Tied", rating: 5, reviews_count: 40 }),
      ],
      {}
    );
    expect(out.map((b) => b.name)).toEqual(["Tied", "High", "Low"]);
  });
});

describe("when nothing matches", () => {
  it("names the answer that opens the result up most", () => {
    const set = [
      broker({ name: "Cheap", min_deposit: 10, swap_free: false }),
      broker({ name: "Islamic", min_deposit: 900, swap_free: true }),
    ];
    // Both answers are satisfied individually and neither together. Dropping
    // the deposit leaves one, dropping islamic leaves one — either is a valid
    // suggestion, but it must name one rather than shrug.
    const blocker = mostRestrictive(set, { deposit: "under-50", islamic: "yes" });
    expect(["deposit", "islamic"]).toContain(blocker);
  });

  it("names the single answer to drop when only one is in the way", () => {
    const set = [broker({ name: "Only", min_deposit: 900 })];
    // Dropping the deposit does open this up to one broker, so saying so is
    // the right advice — not a shrug.
    expect(mostRestrictive(set, { deposit: "under-50" })).toBe("deposit");
  });

  it("suggests nothing when no single change would help", () => {
    /**
     * Three brokers, each satisfying exactly one of the three conditions — so
     * all three questions are asked, and relaxing any one of them still leaves
     * the other two excluding everything. Naming one here would send the
     * reader round in circles, so it names none.
     *
     * Worth stating because the obvious construction does not work: a
     * condition no broker satisfies is not an asked question at all, which
     * makes an answer to it inert rather than restrictive.
     */
    const set = [
      broker({ name: "Cheap", min_deposit: 10, swap_free: false, allows_scalping: false }),
      broker({ name: "Islamic", min_deposit: 900, swap_free: true, allows_scalping: false }),
      broker({ name: "Scalper", min_deposit: 900, swap_free: false, allows_scalping: true }),
    ];
    expect(matchBrokers(set, { deposit: "under-50", islamic: "yes", style: "scalping" }))
      .toHaveLength(0);
    expect(
      mostRestrictive(set, { deposit: "under-50", islamic: "yes", style: "scalping" })
    ).toBeNull();
  });

  it("suggests nothing when nothing was answered", () => {
    expect(mostRestrictive([broker({})], {})).toBeNull();
  });
});

describe("question ids", () => {
  it("are unique, since each one owns a URL parameter", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
