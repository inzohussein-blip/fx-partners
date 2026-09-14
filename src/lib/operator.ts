import { getContent } from "@/lib/content";

/**
 * Who operates this site.
 *
 * Identifying the operator is not decoration. The e-Commerce Directive
 * requires a site aimed at EU users to name the provider, its address and a
 * fast means of contact; consumer law in most Gulf states expects the same of
 * a commercial site; and the privacy policy and terms both now say that the
 * controller and the governing law are "the entity named on the About page".
 * If that entity is not named, those two clauses point at nothing.
 *
 * The fields are owner-supplied and start empty on purpose — a placeholder
 * legal name is worse than a blank one, because a blank is obviously missing
 * and a placeholder looks like an answer. What this module adds is a way to
 * ask whether the disclosure is actually complete, so the gap is visible
 * instead of silently hidden by an `if (facts.length > 0)`.
 */
export type Operator = {
  legal_name: string;
  founded: string;
  location: string;
  registration: string;
  email: string;
};

export const OPERATOR_KEY = "page.about.company";

const EMPTY: Operator = {
  legal_name: "",
  founded: "",
  location: "",
  registration: "",
  email: "",
};

/** The fields without which the legal disclosure is incomplete. */
export const REQUIRED: (keyof Operator)[] = ["legal_name", "location", "email"];

export async function getOperator(): Promise<Operator> {
  const raw = await getContent(OPERATOR_KEY, EMPTY);
  // Normalise so a whitespace-only value counts as absent rather than present.
  return Object.fromEntries(
    (Object.keys(EMPTY) as (keyof Operator)[]).map((k) => [k, (raw[k] ?? "").trim()])
  ) as Operator;
}

/** Which required fields are still unset. Empty means the disclosure is complete. */
export function missingFields(op: Operator): (keyof Operator)[] {
  return REQUIRED.filter((k) => op[k].length === 0);
}

export function isComplete(op: Operator): boolean {
  return missingFields(op).length === 0;
}
