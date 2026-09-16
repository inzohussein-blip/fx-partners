import { createClient } from "@/lib/supabase/server";
import type { Broker } from "@/lib/brokers";

/** Every column the comparison and category pages read. */
const COLUMNS =
  "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count," +
  "badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable,supports_gold,licenses," +
  "supports_ea,allows_hedging,swap_free,allows_scalping,min_deposit,deposit_methods," +
  "platforms,accepted_countries," +
  "broker_links(id,label,referral_url,agent_commission,client_benefits)";

/**
 * Published brokers, with the full spec set.
 *
 * The same query was written out in /compare and needed again by every "best
 * for" page. Having it in one place matters more than saving the keystrokes:
 * a column missing from the select silently becomes `undefined`, and a
 * category that filters on `swap_free` would then quietly return nothing
 * rather than fail — an empty page with no error to explain it.
 */
export async function getPublishedBrokers(): Promise<Broker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("brokers")
      .select(COLUMNS)
      .eq("is_published", true)
      .order("sort_order")
      .order("rating", { ascending: false });
    return (data as unknown as Broker[]) ?? [];
  } catch {
    return [];
  }
}
