import { createClient } from "@/lib/supabase/server";
import {
  CampaignsManager,
  type AdminCampaign,
} from "@/components/dashboard/campaigns-manager";
import {
  CouponsManager,
  type AdminCoupon,
} from "@/components/dashboard/coupons-manager";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  let campaigns: AdminCampaign[] = [];
  let coupons: AdminCoupon[] = [];
  let brokers: { id: string; name: string }[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: c }, { data: cp }, { data: b }] = await Promise.all([
      supabase
        .from("campaigns")
        .select("id,broker_slug,title,message,cta_label,is_active,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("coupons")
        .select("id,broker_name,title,code,referral_url,is_active")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("brokers").select("id,name").order("sort_order"),
    ]);
    campaigns = (c as AdminCampaign[]) ?? [];
    coupons = (cp as AdminCoupon[]) ?? [];
    brokers = (b as { id: string; name: string }[]) ?? [];
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">العروض والكوبونات</h1>
        <p className="mt-1 text-sm text-slate-400">
          أطلق عروضاً حصرية تظهر فوراً كلافتة متحركة لكل الزوّار، وأضِف أكواد
          كوبونات في صفحة العروض.
        </p>
      </header>

      <CampaignsManager campaigns={campaigns} brokers={brokers} />

      <div className="border-t border-white/5 pt-8">
        <h2 className="mb-4 text-lg font-bold text-white">الكوبونات</h2>
        <CouponsManager coupons={coupons} brokers={brokers} />
      </div>
    </div>
  );
}
