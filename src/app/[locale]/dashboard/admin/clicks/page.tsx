import { PageHeader } from "@/components/dashboard/page-header";
import { ClickAnalytics } from "@/components/dashboard/click-analytics";
import {
  getReferralClicks,
  getBrokerClicks,
  getBrokerClicksByAgent,
} from "@/lib/clicks";
import { MousePointerClick, Users, Info } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Click reporting for the whole network.
 *
 * The same RPCs the agent page uses; RLS is what widens the result to every
 * agent when an admin calls them, so there is no second "admin version" of the
 * query to keep in sync.
 */
export default async function AdminClicksPage() {
  const [refClicks, brokerClicks, byAgent] = await Promise.all([
    getReferralClicks(30),
    getBrokerClicks(30),
    getBrokerClicksByAgent(30),
  ]);

  const attributed = byAgent.reduce((n, a) => n + a.clicks, 0);
  const unattributed = Math.max(0, brokerClicks.total - attributed);
  const maxAgent = Math.max(1, ...byAgent.map((a) => a.clicks));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MousePointerClick}
        title="رصد النقرات"
        subtitle="نقرات روابط الوكلاء وروابط حسابات الشركات — آخر ٣٠ يوماً."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ClickAnalytics
          title="روابط الوكلاء"
          subtitle="كل النقرات على روابط /r/ في الشبكة."
          series={refClicks.series}
          countries={refClicks.countries}
        />
        <ClickAnalytics
          title="روابط حسابات الشركات"
          subtitle="كل النقرات على روابط /go/ المؤدّية إلى شركات التداول."
          series={brokerClicks.series}
          countries={brokerClicks.countries}
        />
      </div>

      {/* The number this whole feature exists for. */}
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/20">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white sm:text-base">
              أي وكيل يقود إلى حسابات الشركات
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              النقرات على روابط الشركات منسوبةً إلى الوكيل الذي جلب الزائر.
            </p>
          </div>
        </div>

        {byAgent.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
            لا توجد نقرات منسوبة بعد.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {byAgent.slice(0, 20).map((a) => (
              <li key={a.ib_id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {a.display_name || a.ib_code}
                  </span>
                  <span className="block text-[11px] text-slate-500" dir="ltr">
                    {a.ib_code}
                  </span>
                </span>
                <span className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-white/5 sm:block">
                  <span
                    className="block h-full rounded-full bg-brand-gradient"
                    style={{ width: `${(a.clicks / maxAgent) * 100}%` }}
                  />
                </span>
                <span
                  className="w-12 shrink-0 text-end text-sm font-bold text-brand-300"
                  dir="ltr"
                >
                  {a.clicks}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Attribution depends on a 30-day cookie, so a share of clicks will
            always be unattributed — someone who found a broker page through
            search never passed an agent link. Saying so is more useful than
            quietly folding those clicks into a total. */}
        {brokerClicks.total > 0 && (
          <p className="mt-5 flex items-start gap-2 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {unattributed.toLocaleString("en-US")} من أصل{" "}
              {brokerClicks.total.toLocaleString("en-US")} نقرة غير منسوبة لوكيل —
              زائر وصل إلى صفحة الشركة مباشرةً أو من بحث، أو انتهت صلاحية كوكي
              الإحالة (٣٠ يوماً). النقرات المسجَّلة قبل تفعيل النسب تظهر هنا أيضاً.
            </span>
          </p>
        )}
      </section>
    </div>
  );
}
