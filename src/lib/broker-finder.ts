import type { Broker } from "@/lib/brokers";

/**
 * The guided broker finder.
 *
 * Distinct from the directory's filter panel, which is a power tool for
 * someone already browsing. This asks a few questions and narrows to a
 * shortlist — the thing a visitor who has never chosen a broker actually
 * needs, and the widget every established comparison site in this niche leads
 * with.
 *
 * Two rules keep it from lying:
 *
 * A question is only asked when the data can answer it. If no broker records
 * its platforms, the platform question does not appear — rather than offering
 * a dropdown that silently matches nothing, or worse, matches everything and
 * implies we checked.
 *
 * An unknown is never a match. A broker with no `min_deposit` does not satisfy
 * "under $50", and one with an empty `accepted_countries` does not satisfy
 * "accepts Iraq". Empty means we have not verified it, which is not the same
 * as "yes" and must never be shown as one.
 */

export type AnswerMap = Record<string, string | undefined>;

export type FinderOption = {
  /** Stored in the URL, so it must stay stable. */
  value: string;
  /** Key in the `Finder` message namespace. */
  labelKey: string;
  matches: (b: Broker) => boolean;
};

export type FinderQuestion = {
  /** URL parameter name and message-key prefix. */
  id: string;
  labelKey: string;
  /**
   * Can the broker set answer this question at all? A question nothing can
   * answer is not asked.
   */
  answerable: (brokers: Broker[]) => boolean;
  options: (brokers: Broker[]) => FinderOption[];
};

/** A number we hold, as opposed to one we do not. */
const has = (n: number | null | undefined): n is number => typeof n === "number";

/** Platform codes in the order they are worth offering. */
const PLATFORMS = ["mt4", "mt5", "ctrader", "tradingview", "proprietary"] as const;

export const QUESTIONS: FinderQuestion[] = [
  {
    id: "deposit",
    labelKey: "depositLabel",
    answerable: (bs) => bs.some((b) => has(b.min_deposit)),
    options: () => [
      {
        value: "under-50",
        labelKey: "depositUnder50",
        matches: (b) => has(b.min_deposit) && b.min_deposit <= 50,
      },
      {
        value: "under-250",
        labelKey: "depositUnder250",
        matches: (b) => has(b.min_deposit) && b.min_deposit <= 250,
      },
      {
        value: "any",
        labelKey: "depositAny",
        // "No preference" is not a filter; it must not quietly exclude a
        // broker whose minimum we have never recorded.
        matches: () => true,
      },
    ],
  },
  {
    id: "style",
    labelKey: "styleLabel",
    answerable: (bs) =>
      bs.some((b) => b.allows_scalping || b.supports_ea || b.allows_hedging || b.supports_gold),
    options: () => [
      { value: "scalping", labelKey: "styleScalping", matches: (b) => b.allows_scalping === true },
      { value: "automated", labelKey: "styleAutomated", matches: (b) => b.supports_ea === true },
      { value: "hedging", labelKey: "styleHedging", matches: (b) => b.allows_hedging === true },
      { value: "gold", labelKey: "styleGold", matches: (b) => b.supports_gold === true },
      { value: "any", labelKey: "styleAny", matches: () => true },
    ],
  },
  {
    id: "islamic",
    labelKey: "islamicLabel",
    answerable: (bs) => bs.some((b) => b.swap_free === true),
    options: () => [
      { value: "yes", labelKey: "islamicYes", matches: (b) => b.swap_free === true },
      { value: "any", labelKey: "islamicAny", matches: () => true },
    ],
  },
  {
    id: "platform",
    labelKey: "platformLabel",
    answerable: (bs) => bs.some((b) => (b.platforms?.length ?? 0) > 0),
    // Only platforms someone actually offers are listed, so the reader never
    // picks one and lands on an empty result we could have predicted.
    options: (bs) => {
      const offered = new Set(bs.flatMap((b) => b.platforms ?? []).map((p) => p.toLowerCase()));
      return [
        ...PLATFORMS.filter((p) => offered.has(p)).map((p) => ({
          value: p,
          labelKey: `platform_${p}`,
          matches: (b: Broker) => (b.platforms ?? []).some((x) => x.toLowerCase() === p),
        })),
        { value: "any", labelKey: "platformAny", matches: () => true },
      ];
    },
  },
  {
    id: "country",
    labelKey: "countryLabel",
    answerable: (bs) => bs.some((b) => (b.accepted_countries?.length ?? 0) > 0),
    options: (bs) => {
      const codes = Array.from(
        new Set(bs.flatMap((b) => b.accepted_countries ?? []).map((c) => c.toUpperCase()))
      ).sort();
      return [
        ...codes.map((c) => ({
          value: c,
          labelKey: `country_${c}`,
          matches: (b: Broker) =>
            (b.accepted_countries ?? []).some((x) => x.toUpperCase() === c),
        })),
        { value: "any", labelKey: "countryAny", matches: () => true },
      ];
    },
  },
];

/** The questions worth asking of this particular broker set. */
export function askableQuestions(brokers: Broker[]): FinderQuestion[] {
  return QUESTIONS.filter((q) => q.answerable(brokers) && q.options(brokers).length > 1);
}

/**
 * Brokers matching every answered question.
 *
 * Unanswered questions and the explicit "no preference" option both leave the
 * set alone. Results are ordered the way the directory orders them — rating,
 * then review count — because once the reader has filtered to what they need,
 * what separates the survivors is what other people found.
 */
export function matchBrokers(brokers: Broker[], answers: AnswerMap): Broker[] {
  const active = askableQuestions(brokers);
  return brokers
    .filter((b) =>
      active.every((q) => {
        const answer = answers[q.id];
        if (!answer) return true;
        const option = q.options(brokers).find((o) => o.value === answer);
        // An answer we do not recognise is ignored rather than matching
        // nothing: a stale or hand-edited URL should not produce an empty page.
        return option ? option.matches(b) : true;
      })
    )
    .sort((a, b) => b.rating - a.rating || b.reviews_count - a.reviews_count);
}

/**
 * When nothing matches, which single answer to suggest dropping.
 *
 * "No results, start over" is the worst possible outcome for a guided tool.
 * This re-runs the match with each answered question removed in turn and
 * returns the one that most opens the result up, so the UI can say exactly
 * what to change instead of leaving the reader to guess.
 */
export function mostRestrictive(brokers: Broker[], answers: AnswerMap): string | null {
  const answered = askableQuestions(brokers)
    .map((q) => q.id)
    .filter((id) => answers[id] && answers[id] !== "any");
  if (answered.length === 0) return null;

  let best: { id: string; count: number } | null = null;
  for (const id of answered) {
    const without: AnswerMap = { ...answers, [id]: undefined };
    const count = matchBrokers(brokers, without).length;
    if (!best || count > best.count) best = { id, count };
  }
  return best && best.count > 0 ? best.id : null;
}
