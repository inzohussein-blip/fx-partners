import { createClient } from "@/lib/supabase/server";

export type SiteStats = {
  brokers: number;
  agents: number;
  countries: number;
};

/**
 * Real counts for the figures the marketing pages advertise.
 *
 * These used to be strings in the message catalogue — "2,400+ active agents",
 * "40+ partner brokers", "$18B+ volume" — with nothing behind them. They are
 * now read from the database through an aggregate-only function, and a caller
 * that gets a zero is expected to render nothing rather than round it up.
 *
 * A figure this returns is a figure the site can be asked to prove.
 */
export async function getSiteStats(): Promise<SiteStats> {
  const empty: SiteStats = { brokers: 0, agents: 0, countries: 0 };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return empty;
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc("site_stats").maybeSingle();
    if (!data) return empty;
    const row = data as Partial<SiteStats>;
    return {
      brokers: Number(row.brokers ?? 0),
      agents: Number(row.agents ?? 0),
      countries: Number(row.countries ?? 0),
    };
  } catch {
    return empty;
  }
}

/**
 * The threshold below which a count is not worth publishing.
 *
 * Not a rounding rule — the number shown is always the real one. This only
 * decides whether a figure is said at all: "1 partner broker" on a landing
 * page invites the reader to draw a conclusion the number cannot support, so
 * below this the claim is simply left out.
 */
export const MIN_PUBLISHABLE = 3;

export function worthShowing(n: number): boolean {
  return n >= MIN_PUBLISHABLE;
}
