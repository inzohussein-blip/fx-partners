import { createClient } from "@/lib/supabase/server";
import {
  CampaignsManager,
  type AdminCampaign,
} from "@/components/dashboard/campaigns-manager";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  let campaigns: AdminCampaign[] = [];
  let brokers: { id: string; name: string }[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: c }, { data: b }] = await Promise.all([
      supabase
        .from("campaigns")
        .select("id,broker_slug,title,message,cta_label,is_active,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("brokers").select("id,name").order("sort_order"),
    ]);
    campaigns = (c as AdminCampaign[]) ?? [];
    brokers = (b as { id: string; name: string }[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">العروض (القنّاص المالي)</h1>
        <p className="mt-1 text-sm text-slate-400">
          أطلق عروضاً حصرية تظهر فوراً كلافتة متحركة لكل الزوّار وفي صفحة العروض.
        </p>
      </header>

      <CampaignsManager campaigns={campaigns} brokers={brokers} />
    </div>
  );
}
