import { createPublicClient } from "@/lib/supabase/public";

export type SpreadRow = {
  brokerId: string;
  brokerName: string;
  brokerSlug: string | null;
  logoUrl: string | null;
  instrument: string;
  category: string;
  spread: number;
  accountType: string | null;
  sourceUrl: string | null;
  sourceNote: string | null;
  /** ISO timestamp of the last edit to this figure. */
  updatedAt: string | null;
};

/**
 * Per-instrument broker spreads for the /spreads heatmap. Public comparison
 * data; returns [] when Supabase is unconfigured or on any error.
 */
export async function getBrokerSpreads(): Promise<SpreadRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("broker_spreads")
      .select(
        "instrument, category, spread, account_type, source_url, source_note, updated_at, brokers(id, name, slug, logo_url)"
      )
      .limit(2000);

    return ((data as unknown[]) ?? [])
      .map((raw) => {
        const r = raw as {
          instrument: string;
          category: string | null;
          spread: number;
          account_type: string | null;
          source_url: string | null;
          source_note: string | null;
          updated_at: string | null;
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
          accountType: r.account_type ?? null,
          sourceUrl: r.source_url ?? null,
          sourceNote: r.source_note ?? null,
          updatedAt: r.updated_at ?? null,
        };
      })
      .filter((r) => r.brokerName && Number.isFinite(r.spread));
  } catch {
    return [];
  }
}
