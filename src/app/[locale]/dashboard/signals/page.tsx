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
      <header>
        <h1 className="text-2xl font-bold text-white">التوصيات والتحليلات</h1>
        <p className="mt-1 text-sm text-slate-400">
          توصيات وتحليلات فنية فورية من فريق FX Partners — تتحدّث لحظياً.
        </p>
      </header>

      <SignalsFeed initial={signals} />
    </div>
  );
}
