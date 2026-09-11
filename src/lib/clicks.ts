import { createClient } from "@/lib/supabase/server";

export type ClickDay = { day: string; clicks: number };
export type CountryRow = { country: string; clicks: number };
export type AgentClickRow = {
  ib_id: string;
  ib_code: string;
  display_name: string | null;
  clicks: number;
};

export type ClickReport = {
  series: ClickDay[];
  countries: CountryRow[];
  total: number;
  last7: number;
};

const EMPTY: ClickReport = { series: [], countries: [], total: 0, last7: 0 };

/**
 * Click reporting.
 *
 * Every function here calls a SECURITY INVOKER RPC, so row-level security does
 * the scoping: an agent's call returns their own clicks and an admin's returns
 * everything, from the same code path. Nothing re-checks the caller's role in
 * JavaScript, which is where that kind of rule tends to drift out of sync with
 * the database.
 */
async function report(
  source: "referral" | "broker",
  days: number
): Promise<ClickReport> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return EMPTY;
  try {
    const supabase = createClient();
    const fn = source === "referral" ? "referral_clicks_daily" : "broker_clicks_daily";
    const [{ data: series }, { data: countries }] = await Promise.all([
      supabase.rpc(fn, { p_days: days }),
      supabase.rpc("clicks_by_country", { p_days: days, p_source: source }),
    ]);

    const rows = (series as ClickDay[] | null) ?? [];
    const total = rows.reduce((n, r) => n + Number(r.clicks ?? 0), 0);
    const last7 = rows
      .slice(-7)
      .reduce((n, r) => n + Number(r.clicks ?? 0), 0);

    return {
      series: rows.map((r) => ({ day: String(r.day), clicks: Number(r.clicks ?? 0) })),
      countries: ((countries as CountryRow[] | null) ?? []).map((c) => ({
        country: c.country,
        clicks: Number(c.clicks ?? 0),
      })),
      total,
      last7,
    };
  } catch {
    return EMPTY;
  }
}

/** Clicks on the caller's own referral links (`/r/<slug>`). */
export function getReferralClicks(days = 30): Promise<ClickReport> {
  return report("referral", days);
}

/** Clicks on broker account links (`/go/<code>`). */
export function getBrokerClicks(days = 30): Promise<ClickReport> {
  return report("broker", days);
}

/**
 * Which agents drove clicks through to a broker. This is the number a master
 * IB runs on, and it only exists because /go now resolves the `fxp_ref`
 * cookie — clicks recorded before that land under "غير منسوب".
 */
export async function getBrokerClicksByAgent(days = 30): Promise<AgentClickRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc("broker_clicks_by_agent", { p_days: days });
    return ((data as AgentClickRow[] | null) ?? []).map((r) => ({
      ...r,
      clicks: Number(r.clicks ?? 0),
    }));
  } catch {
    return [];
  }
}
