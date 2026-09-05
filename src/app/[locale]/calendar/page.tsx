import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getUpcomingEvents, EVENT_KINDS, type BrokerEvent } from "@/lib/calendar";
import { CalendarDays, Building2 } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "تقويم عطلات وأحداث شركات التداول",
  description:
    "تابع عطلات التداول الرسمية وتغييرات الهامش وساعات التداول لكل شركة تداول في مكان واحد — لا تُفاجأ بأي تغيير يؤثّر على صفقاتك.",
};

function fmtDate(iso: string): { day: string; rest: string } {
  const d = new Date(iso + "T00:00:00");
  const day = new Intl.DateTimeFormat("ar", { day: "2-digit" }).format(d);
  const rest = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    month: "long",
    year: "numeric",
  }).format(d);
  return { day, rest };
}

export default async function CalendarPage() {
  const events = await getUpcomingEvents();

  // Group by date for an agenda view.
  const groups = new Map<string, BrokerEvent[]>();
  for (const e of events) {
    if (!groups.has(e.event_date)) groups.set(e.event_date, []);
    groups.get(e.event_date)!.push(e);
  }

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: "التقويم المالي" }]} />
          <div className="mt-6">
            <SectionHeading
              eyebrow="التقويم"
              icon={CalendarDays}
              title="تقويم عطلات وأحداث الشركات"
              subtitle="عطلات التداول، تغييرات الهامش، وساعات التداول لكل شركة — محدّثة من فريق FX Partners."
              align="start"
            />
          </div>

          <div className="mt-10">
            {events.length === 0 ? (
              <div className="card-surface">
                <EmptyState
                  icon={CalendarDays}
                  title="لا توجد أحداث قادمة"
                  description="تُضاف الأحداث من لوحة التحكم — عطلات، تغييرات هامش، وساعات تداول لكل شركة."
                />
              </div>
            ) : (
              <div className="space-y-8">
                {Array.from(groups.entries()).map(([date, items]) => {
                  const { day, rest } = fmtDate(date);
                  return (
                    <div key={date} className="flex gap-4">
                      {/* Date rail */}
                      <div className="shrink-0 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-200 ring-1 ring-brand-500/20">
                          <span className="text-xl font-extrabold">{day}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 text-sm font-medium text-slate-400">{rest}</div>
                        <div className="space-y-3">
                          {items.map((e) => {
                            const kind = EVENT_KINDS[e.kind] ?? EVENT_KINDS.holiday;
                            return (
                              <div key={e.id} className="card-surface p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${kind.cls}`}>
                                    {kind.emoji} {kind.label}
                                  </span>
                                  {e.brokerName && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                                      <Building2 className="h-3 w-3" />
                                      {e.brokerName}
                                    </span>
                                  )}
                                  {e.country && (
                                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                                      {e.country}
                                    </span>
                                  )}
                                  {e.event_time && (
                                    <span dir="ltr" className="text-xs text-slate-500">{e.event_time}</span>
                                  )}
                                </div>
                                <h3 className="mt-2 font-bold text-white">{e.title}</h3>
                                {e.description && (
                                  <p className="mt-1 text-sm leading-relaxed text-slate-400" dir="auto">
                                    {e.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
