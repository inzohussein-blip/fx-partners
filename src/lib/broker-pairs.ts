import { createClient } from "@/lib/supabase/server";
import type { Broker } from "@/lib/brokers";

/**
 * Head-to-head pair URLs.
 *
 * "Vantage vs XM" is what someone types right before they choose, and it was
 * being answered by a single page behind query parameters — one indexable URL
 * for every pair in the directory. Each pair gets its own path instead.
 *
 * The slug is ordered alphabetically so a pair has exactly one address: both
 * /compare/vs/vantage-vs-xm and the reverse would otherwise be the same page
 * on two URLs, which is the duplicate this is meant to avoid.
 */
export function pairSlug(a: string, b: string): string {
  return [a, b].sort().join("-vs-");
}

/** Split a pair slug back into its two broker slugs, or null if malformed. */
export function parsePair(pair: string): [string, string] | null {
  const parts = pair.split("-vs-");
  if (parts.length !== 2) return null;
  const [a, b] = parts.map((p) => p.trim());
  if (!a || !b || a === b) return null;
  return [a, b];
}

const BROKER_FIELDS =
  "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating," +
  "reviews_count,badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable," +
  "supports_gold,licenses,broker_links(id,label,referral_url,agent_commission,client_benefits,code)";

/** Both brokers of a pair, or nulls when either is missing or unpublished. */
export async function getPairBrokers(
  a: string,
  b: string
): Promise<[Broker | null, Broker | null]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [null, null];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(BROKER_FIELDS)
      .in("slug", [a, b])
      .eq("is_published", true);
    const rows = (data as unknown as Broker[]) ?? [];
    return [rows.find((r) => r.slug === a) ?? null, rows.find((r) => r.slug === b) ?? null];
  } catch {
    return [null, null];
  }
}

/** Every pair of published brokers, for the sitemap and the internal links. */
export async function getAllPairs(): Promise<
  { slug: string; a: string; b: string; aName: string; bName: string }[]
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select("slug,name")
      .eq("is_published", true)
      .order("sort_order");
    const list = (data as { slug: string; name: string }[] | null) ?? [];
    const out: { slug: string; a: string; b: string; aName: string; bName: string }[] = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [x, y] = [list[i], list[j]];
        out.push({
          slug: pairSlug(x.slug, y.slug),
          a: x.slug,
          b: y.slug,
          aName: x.name,
          bName: y.name,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}
