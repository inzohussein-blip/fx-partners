import { createClient } from "@/lib/supabase/server";

export type NetworkBroker = {
  id: string;
  name: string;
  slug: string;
  status: string;
  links: { id: string; label: string | null; referral_url: string; code: string | null }[];
  coupons: { id: string; title: string; code: string }[];
};

/** Brokers with their referral links and coupons — for the network tree map. */
export async function getNetwork(): Promise<NetworkBroker[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const [{ data: brokers }, { data: coupons }] = await Promise.all([
      supabase
        .from("brokers")
        .select("id,name,slug,status,broker_links(id,label,referral_url,code)")
        .order("sort_order"),
      supabase.from("coupons").select("id,title,code,broker_id"),
    ]);

    const couponsByBroker = new Map<string, { id: string; title: string; code: string }[]>();
    for (const c of (coupons as { id: string; title: string; code: string; broker_id: string | null }[]) ?? []) {
      if (!c.broker_id) continue;
      if (!couponsByBroker.has(c.broker_id)) couponsByBroker.set(c.broker_id, []);
      couponsByBroker.get(c.broker_id)!.push({ id: c.id, title: c.title, code: c.code });
    }

    return ((brokers as unknown[]) ?? []).map((raw) => {
      const b = raw as NetworkBroker & {
        broker_links: { id: string; label: string | null; referral_url: string; code: string | null }[] | null;
      };
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        status: b.status,
        links: b.broker_links ?? [],
        coupons: couponsByBroker.get(b.id) ?? [],
      };
    });
  } catch {
    return [];
  }
}
