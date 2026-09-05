import { PageHeader } from "@/components/dashboard/page-header";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventsManager, type AdminEvent } from "@/components/dashboard/events-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let events: AdminEvent[] = [];
  let brokers: { id: string; name: string }[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const [{ data: e }, { data: b }] = await Promise.all([
      supabase
        .from("broker_events")
        .select("id,title,kind,country,event_date,event_time,is_active,brokers(name)")
        .order("event_date", { ascending: true })
        .limit(200),
      supabase.from("brokers").select("id,name").order("sort_order"),
    ]);
    events = ((e as unknown[]) ?? []).map((raw) => {
      const r = raw as AdminEvent & { brokers: { name: string } | null };
      return { ...r, broker_name: r.brokers?.name ?? null };
    });
    brokers = (b as { id: string; name: string }[]) ?? [];
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={CalendarDays}
        title="التقويم المالي"
        subtitle="أضِف عطلات التداول وتغييرات الهامش وساعات التداول — تظهر فوراً في صفحة التقويم العامة."
      />
      <EventsManager events={events} brokers={brokers} />
    </div>
  );
}
