import { PageHeader } from "@/components/dashboard/page-header";
import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignalsFeed } from "@/components/dashboard/signals-feed";
import type { Signal } from "@/lib/signals";

export const dynamic = "force-dynamic";

async function getSignals(): Promise<Signal[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("signals")
      .select("id,broker_id,title,body,symbol,direction,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    return (data as Signal[]) ?? [];
  } catch {
    return [];
  }
}

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Radio}
        title={"التوصيات والتحليلات"}
        subtitle={"توصيات وتحليلات فنية فورية من فريق FX Partners — تتحدّث لحظياً."}
      />

      <SignalsFeed initial={signals} />
    </div>
  );
}
