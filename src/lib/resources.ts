import { createClient } from "@/lib/supabase/server";
import { linkHref } from "@/lib/brokers";
import type { TradingResource } from "@/lib/resource-kinds";

export type { TradingResource } from "@/lib/resource-kinds";
export { RESOURCE_KINDS } from "@/lib/resource-kinds";

/** Active gated trading resources (indicators / templates / ebooks). */
export async function getResources(): Promise<TradingResource[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("trading_resources")
      .select("id,title,description,kind,file_url,downloads,brokers(name,slug,broker_links(code,referral_url))")
      .eq("is_active", true)
      .order("sort_order")
      .limit(100);

    return ((data as unknown[]) ?? []).map((raw) => {
      const r = raw as TradingResource & {
        brokers: {
          name: string;
          slug: string;
          broker_links: { code: string | null; referral_url: string }[] | null;
        } | null;
      };
      const link = r.brokers?.broker_links?.[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        kind: r.kind,
        file_url: r.file_url,
        downloads: r.downloads,
        brokerName: r.brokers?.name ?? null,
        brokerHref: r.brokers
          ? link
            ? linkHref(link)
            : `/brokers/${r.brokers.slug}`
          : null,
      };
    });
  } catch {
    return [];
  }
}
