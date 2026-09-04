import { createClient } from "@/lib/supabase/server";
import {
  BrokersManager,
  type AdminBroker,
  type PendingReview,
} from "@/components/dashboard/brokers-manager";

export const dynamic = "force-dynamic";

export default async function AdminBrokersPage() {
  let brokers: AdminBroker[] = [];
  let pending: PendingReview[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: b }, { data: r }] = await Promise.all([
      supabase
        .from("brokers")
        .select(
          "id,slug,name,logo_url,status,deposit_bonus,welcome_bonus,description,rating,reviews_count,badges,is_published,sort_order,broker_links(id,label,referral_url,agent_commission,client_benefits,sort_order)"
        )
        .order("sort_order"),
      supabase
        .from("broker_reviews")
        .select("id,broker_id,user_name,comment,stars,created_at,broker:brokers(name)")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

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
      <header>
        <h1 className="text-2xl font-bold text-white">دليل شركات التداول</h1>
        <p className="mt-1 text-sm text-slate-400">
          أضِف الشركات وروابط الإحالة المتعددة، وأشرِف على مراجعات العملاء
          (موافقة/حذف/رد الإدارة).
        </p>
      </header>

      <BrokersManager brokers={brokers} pending={pending} />
    </div>
  );
}
