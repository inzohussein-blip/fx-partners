import { PageHeader } from "@/components/dashboard/page-header";
import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  SignalsManager,
  type AdminSignal,
  type Hook,
} from "@/components/dashboard/signals-manager";

export const dynamic = "force-dynamic";

export default async function AdminSignalsPage() {
  let signals: AdminSignal[] = [];
  let hooks: Hook[] = [];
  let brokers: { id: string; name: string }[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: s }, { data: h }, { data: b }] = await Promise.all([
      supabase
        .from("signals")
        .select("id,broker_id,title,body,symbol,direction,published_at")
        .order("published_at", { ascending: false })
        .limit(100),
      supabase
        .from("outbound_webhooks")
        .select("id,label,url,is_active")
        .order("created_at", { ascending: false }),
      supabase.from("brokers").select("id,name").order("sort_order"),
    ]);
    signals = (s as AdminSignal[]) ?? [];
    hooks = (h as Hook[]) ?? [];
    brokers = (b as { id: string; name: string }[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Radio}
        title={"التوصيات والبثّ"}
        subtitle={"انشر تحليلاً أو توصية لتظهر فوراً للوكلاء وتُبثّ إلى تلغرام وقنوات الويبهوكس."}
      />

      <SignalsManager signals={signals} hooks={hooks} brokers={brokers} />
    </div>
  );
}
