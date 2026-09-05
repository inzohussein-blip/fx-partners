import { createClient } from "@/lib/supabase/server";

export type SpreadRow = {
  brokerId: string;
  brokerName: string;
  brokerSlug: string | null;
  logoUrl: string | null;
  instrument: string;
  category: string;
  spread: number;
};

/**
 * Per-instrument broker spreads for the /spreads heatmap. Public comparison
 * data; returns [] when Supabase is unconfigured or on any error.
 */
export async function getBrokerSpreads(): Promise<SpreadRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("broker_spreads")
      .select("instrument, category, spread, brokers(id, name, slug, logo_url)")
      .limit(2000);

    return ((data as unknown[]) ?? [])
      .map((raw) => {
        const r = raw as {
          instrument: string;
          category: string | null;
          spread: number;
          brokers: {
            id: string;
            name: string;
            slug: string | null;
            logo_url: string | null;
          } | null;
        };
        return {
          brokerId: r.brokers?.id ?? "",
          brokerName: r.brokers?.name ?? "",
          brokerSlug: r.brokers?.slug ?? null,
          logoUrl: r.brokers?.logo_url ?? null,
          instrument: r.instrument,
          category: r.category || "forex",
          spread: Number(r.spread),
        };
      })
      .filter((r) => r.brokerName && Number.isFinite(r.spread));
  } catch {
    return [];
  }
}
