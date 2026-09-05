import { PageHeader } from "@/components/dashboard/page-header";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  BrokersManager,
  type AdminBroker,
  type PendingReview,
  type CountryStat,
} from "@/components/dashboard/brokers-manager";
import { ReorderPanel } from "@/components/dashboard/reorder-panel";

export const dynamic = "force-dynamic";

export default async function AdminBrokersPage() {
  let brokers: AdminBroker[] = [];
  let pending: PendingReview[] = [];
  let countries: Record<string, CountryStat[]> = {};

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: b }, { data: r }, { data: clicks }] = await Promise.all([
      supabase
        .from("brokers")
        .select(
          "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,spread_from,leverage_max,bonus_no_deposit,bonus_withdrawable,supports_gold,licenses,is_published,sort_order,broker_links(id,label,referral_url,agent_commission,client_benefits,sort_order,code,clicks)"
        )
        .order("sort_order"),
      supabase
        .from("broker_reviews")
        .select("id,broker_id,user_name,comment,stars,created_at,broker:brokers(name)")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("broker_link_clicks")
        .select("broker_id,country")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    // Aggregate top countries per broker from recent clicks.
    const agg: Record<string, Record<string, number>> = {};
    for (const c of (clicks as { broker_id: string; country: string | null }[]) ?? []) {
      if (!c.broker_id) continue;
      const key = c.country || "—";
      (agg[c.broker_id] ??= {})[key] = (agg[c.broker_id]?.[key] ?? 0) + 1;
    }
    countries = Object.fromEntries(
      Object.entries(agg).map(([bid, m]) => [
        bid,
        Object.entries(m)
          .map(([country, hits]) => ({ country, hits }))
          .sort((a, b) => b.hits - a.hits)
          .slice(0, 5),
      ])
    );

    brokers = (b as unknown as AdminBroker[]) ?? [];
    pending =
      (r as unknown as (Omit<PendingReview, "broker_name"> & {
        broker: { name: string } | { name: string }[] | null;
      })[])?.map((row) => ({
        id: row.id,
        broker_id: row.broker_id,
        user_name: row.user_name,
        comment: row.comment,
        stars: row.stars,
        created_at: row.created_at,
        broker_name: Array.isArray(row.broker)
          ? row.broker[0]?.name ?? ""
          : row.broker?.name ?? "",
      })) ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title={"دليل شركات التداول"}
        subtitle={"أضِف الشركات وروابط الإحالة المتعددة، وأشرِف على مراجعات العملاء (موافقة/حذف/رد الإدارة)."}
      />

      {brokers.length > 1 && (
        <details className="card-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            ترتيب عرض الشركات (سحب وإفلات)
          </summary>
          <p className="mt-1 text-xs text-slate-500">
            اسحب الشركات لإعادة ترتيبها كما تظهر للزوّار، ثم احفظ.
          </p>
          <div className="mt-4">
            <ReorderPanel
              table="brokers"
              items={brokers.map((b) => ({
                id: b.id,
                label: b.name,
                sublabel: b.status === "partnered" ? "شريك" : "غير شريك",
                logo: b.logo_url,
              }))}
            />
          </div>
        </details>
      )}

      <BrokersManager brokers={brokers} pending={pending} countries={countries} />
    </div>
  );
}
