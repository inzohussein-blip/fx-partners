import { createClient } from "@/lib/supabase/server";

export type BrokerEvent = {
  id: string;
  title: string;
  description: string | null;
  kind: string; // holiday | margin | hours | news
  country: string | null;
  event_date: string;
  event_time: string | null;
  brokerName: string | null;
  brokerSlug: string | null;
};

export const EVENT_KINDS: Record<string, { label: string; cls: string; emoji: string }> = {
  holiday: { label: "عطلة رسمية", cls: "bg-amber-500/10 text-amber-300", emoji: "🏖️" },
  margin: { label: "تغيير الهامش", cls: "bg-rose-500/10 text-rose-300", emoji: "⚠️" },
  hours: { label: "ساعات التداول", cls: "bg-brand-500/10 text-brand-200", emoji: "🕒" },
  news: { label: "خبر مؤثّر", cls: "bg-accent-500/10 text-accent-300", emoji: "📰" },
};

/** Upcoming broker calendar events (today onward), oldest first. */
export async function getUpcomingEvents(): Promise<BrokerEvent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("broker_events")
      .select("id,title,description,kind,country,event_date,event_time,brokers(name,slug)")
      .eq("is_active", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(200);

    return ((data as unknown[]) ?? []).map((raw) => {
      const r = raw as BrokerEvent & { brokers: { name: string; slug: string } | null };
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        kind: r.kind,
        country: r.country,
        event_date: r.event_date,
        event_time: r.event_time,
        brokerName: r.brokers?.name ?? null,
        brokerSlug: r.brokers?.slug ?? null,
      };
    });
  } catch {
    return [];
  }
}
