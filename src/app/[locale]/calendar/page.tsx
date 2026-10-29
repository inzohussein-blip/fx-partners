import type { Metadata } from "next";
import { pageMeta, KEYWORDS } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getUpcomingEvents, EVENT_KINDS, type BrokerEvent } from "@/lib/calendar";
import { CalendarDays, Building2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { TV_BASE, CALENDAR_COUNTRIES } from "@/lib/tradingview";
import { indicatorBySlug } from "@/lib/indicators";

export const revalidate = 300;

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return pageMeta({
    title: "تقويم عطلات شركات التداول وتغييرات الهامش",
    description:
      "تابع عطلات التداول الرسمية وتغييرات الهامش وساعات التداول لكل شركة في مكان واحد — لا تُفاجأ بأي تغيير يؤثّر على صفقاتك المفتوحة.",
    path: "/calendar",
    keywords: KEYWORDS.tools,
    locale,
  });
}

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

export default async function CalendarPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  const events = await getUpcomingEvents();
  const tm = await getTranslations({ locale, namespace: "MarketsPage" });

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
              as="h1"
              eyebrow="التقويم"
              icon={CalendarDays}
              title="تقويم عطلات وأحداث الشركات"
              subtitle="عطلات التداول، تغييرات الهامش، وساعات التداول لكل شركة — محدّثة من فريق Partners FX."
              align="start"
            />
          </div>

          <section className="card-surface mt-10 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-fg">{tm("calTitle")}</h2>
            <p className="mt-1 text-sm text-slate-400">{tm("calIntro")}</p>
            <div className="mt-4">
              <TradingViewWidget
                scriptSrc={`${TV_BASE}/embed-widget-events.js`}
                height={520}
                config={{
                  width: "100%",
                  height: "100%",
                  isTransparent: true,
                  importanceFilter: "0,1",
                  countryFilter: CALENDAR_COUNTRIES,
                }}
              />
            </div>
            <Link
              href="/markets"
              className="mt-3 inline-block text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              {tm("calMore")}
            </Link>
          </section>

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
                                    <span className="inline-flex items-center gap-1 rounded-full bg-fg/5 px-2.5 py-0.5 text-xs text-slate-300">
                                      <Building2 className="h-3 w-3" />
                                      {e.brokerName}
                                    </span>
                                  )}
                                  {e.country && (
                                    <span className="rounded-full bg-fg/5 px-2 py-0.5 text-xs sm:text-[11px] text-slate-400">
                                      {e.country}
                                    </span>
                                  )}
                                  {e.event_time && (
                                    <span dir="ltr" className="text-xs text-slate-500">{e.event_time}</span>
                                  )}
                                </div>
                                <h3 className="mt-2 font-bold text-fg">{e.title}</h3>
                                {e.indicator && indicatorBySlug(e.indicator) && (
                                  <Link
                                    href={`/indicators/${e.indicator}`}
                                    className="mt-1 inline-block text-xs font-semibold text-brand-300 hover:text-brand-200"
                                  >
                                    {tm("whatIs", { code: indicatorBySlug(e.indicator)!.code })}
                                  </Link>
                                )}
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
