"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryState } from "nuqs";
import { Link } from "@/i18n/navigation";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { BrokerRating } from "@/components/brokers/broker-rating";
import { isRated, statusLabel, regulatorMeta, type Broker } from "@/lib/brokers";
import { cn } from "@/lib/utils";
import { BadgeCheck, Gift, Search, ArrowLeft, Building2, SlidersHorizontal, X } from "lucide-react";

type Filter = "all" | "partnered" | "not_partnered" | "bonus";
type Sort = "recommended" | "rating" | "reviews" | "name" | "spread";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "partnered", label: "شركاء معتمدون" },
  { key: "not_partnered", label: "غير متعاقد" },
  { key: "bonus", label: "يقدّم بونص" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "recommended", label: "المقترح" },
  { key: "rating", label: "الأعلى تقييماً" },
  { key: "spread", label: "أقل سبريد" },
  { key: "reviews", label: "الأكثر مراجعات" },
  { key: "name", label: "الاسم" },
];

// Advanced sidebar-style toggle filters.
const TOGGLES: { key: "bonus_no_deposit" | "bonus_withdrawable" | "supports_gold"; label: string }[] = [
  { key: "bonus_no_deposit", label: "بونص بدون إيداع" },
  { key: "bonus_withdrawable", label: "بونص قابل للسحب" },
  { key: "supports_gold", label: "يدعم تداول الذهب" },
];

/** Rows shown before "show more", and how many each press adds. */
const PAGE = 20;

const licenceCount = (b: Broker) => (b.licenses ?? []).filter((k) => regulatorMeta(k)).length;

/**
 * The default order. Sorting by our rating alone was a no-op while no broker
 * has reviews, so the list fell back to import order. This puts what we know
 * first: brokers with real reviews, then verified regulators, then the
 * external score (shown as unverified) — and import order only as a tiebreak.
 */
function recommendedOrder(a: Broker, b: Broker): number {
  const ar = isRated(a), br = isRated(b);
  if (ar !== br) return ar ? -1 : 1;
  if (ar && b.rating !== a.rating) return b.rating - a.rating;
  const lc = licenceCount(b) - licenceCount(a);
  if (lc !== 0) return lc;
  return (b.external_score ?? -1) - (a.external_score ?? -1);
}

function bestCommission(b: Broker): string | null {
  const links = b.broker_links ?? [];
  const withC = links.find((l) => l.agent_commission);
  return withC?.agent_commission ?? null;
}

function LicenseBadges({ licenses }: { licenses?: string[] }) {
  const list = (licenses ?? []).map((k) => regulatorMeta(k)).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((r, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs sm:text-[10px] text-emerald-300"
        >
          {r!.flag} {r!.label}
        </span>
      ))}
    </div>
  );
}

export function BrokerDirectory({ brokers }: { brokers: Broker[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [shown, setShown] = useState(PAGE);
  // The search term lives in the URL, not component state: it makes a filtered
  // view shareable, lets the site declare a real SearchAction to Google, and
  // gives an assistant a URL it can hand a user ("/compare?q=xm").
  const [q, setQ] = useQueryState("q", { defaultValue: "", clearOnDefault: true });
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const rows = useMemo(() => {
    let list = brokers.slice();
    if (filter === "partnered") list = list.filter((b) => b.status === "partnered");
    else if (filter === "not_partnered")
      list = list.filter((b) => b.status === "not_partnered");
    else if (filter === "bonus")
      list = list.filter((b) => b.deposit_bonus || b.welcome_bonus);

    for (const tg of TOGGLES) {
      if (toggles[tg.key]) list = list.filter((b) => Boolean(b[tg.key]));
    }

    const query = q.trim().toLowerCase();
    if (query) list = list.filter((b) => b.name.toLowerCase().includes(query));

    // Array.prototype.sort is stable, so equal keys keep the import order.
    list.sort((a, b) => {
      if (sort === "recommended") return recommendedOrder(a, b);
      if (sort === "rating") return b.rating - a.rating || (b.external_score ?? -1) - (a.external_score ?? -1);
      if (sort === "reviews") return b.reviews_count - a.reviews_count;
      if (sort === "spread") {
        const sa = a.spread_from ?? Infinity;
        const sb = b.spread_from ?? Infinity;
        return sa - sb;
      }
      return a.name.localeCompare(b.name, "ar");
    });
    return list;
  }, [brokers, filter, sort, q, toggles]);

  // A new filter, search or sort starts again from the first page.
  useEffect(() => setShown(PAGE), [filter, sort, q, toggles]);
  const visible = rows.slice(0, shown);
  const remaining = rows.length - visible.length;

  // Desktop columns are shown only when at least one broker has the value.
  // Every broker had "—" in spread, both bonuses and agent commission, so the
  // table was four columns of dashes squeezing the names onto two lines.
  const cols = useMemo(
    () => ({
      status: brokers.some((b) => b.status === "partnered"),
      spread: brokers.some((b) => b.spread_from != null),
      depositBonus: brokers.some((b) => b.deposit_bonus),
      welcomeBonus: brokers.some((b) => b.welcome_bonus),
      commission: brokers.some((b) => bestCommission(b)),
    }),
    [brokers]
  );

  const activeCount =
    (filter !== "all" ? 1 : 0) +
    Object.values(toggles).filter(Boolean).length +
    (q.trim() ? 1 : 0);

  const searchBox = (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن شركة…"
            aria-label="ابحث عن شركة"
            className="min-h-11 w-full rounded-xl border border-fg/10 bg-ink-900/60 py-2.5 pe-4 ps-9 text-sm text-fg placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none"
          />
        </div>
  );

  const renderFilters = (withSearch: boolean) => (
    <>
        {withSearch && searchBox}

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الحالة</span>
            {activeCount > 0 && (
              <button
                onClick={() => {
                  setFilter("all");
                  setToggles({});
                  setQ("");
                }}
                className="text-xs sm:text-[11px] text-brand-300 hover:text-brand-200"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
          <div className="mt-3 space-y-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-right text-sm transition",
                  filter === f.key
                    ? "bg-brand-500/15 text-brand-200"
                    : "text-slate-400 hover:bg-fg/5 hover:text-fg"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-fg/5 pt-4">
            <span className="text-xs font-semibold text-slate-400">فلترة دقيقة</span>
            <div className="mt-3 space-y-2">
              {TOGGLES.map((tg) => {
                const on = !!toggles[tg.key];
                return (
                  <label
                    key={tg.key}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300"
                  >
                    <span
                      onClick={() => setToggles((s) => ({ ...s, [tg.key]: !s[tg.key] }))}
                      className={cn(
                        "grid h-4 w-4 place-items-center rounded border text-xs sm:text-[10px] transition",
                        on ? "border-brand-400 bg-brand-500 text-white" : "border-fg/20"
                      )}
                    >
                      {on ? "✓" : ""}
                    </span>
                    {tg.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-fg/5 pt-4">
            <span className="text-xs font-semibold text-slate-400">الترتيب</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="mt-2 w-full rounded-xl border border-fg/10 bg-ink-900/60 px-3 py-2 text-sm text-fg focus:border-brand-500/50 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
          </>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Filters — sidebar on desktop, bottom-sheet on mobile */}
      <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-5">{renderFilters(true)}</div>
      </aside>

      {/* Mobile: search stays on the page — hidden in the sheet, nobody found it */}
      <div className="lg:hidden">{searchBox}</div>

      {/* Mobile: filter trigger */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-fg/10 bg-ink-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-fg/5 lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-300" />
          الفلاتر والترتيب
        </span>
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-xs sm:text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile bottom-sheet */}
      {mounted &&
        sheetOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSheetOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="الفلاتر"
              style={{ backgroundColor: "#0b1a1c" }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-fg/10 p-5 pb-8 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-fg/15" aria-hidden />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-fg">الفلاتر والترتيب</h3>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="إغلاق"
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-fg/5 hover:text-fg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-5">{renderFilters(false)}</div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="btn-gradient mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-white shadow-glow"
              >
                عرض {rows.length} شركة
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Results */}
      <div className="min-w-0 space-y-6">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-fg">{rows.length}</span> شركة
        </p>

      {/* Comparison table (desktop) */}
      <div className="card-surface hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-fg/5 text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">الشركة</th>
                <th className="px-5 py-3 font-medium">التراخيص الموثّقة</th>
                <th className="px-5 py-3 font-medium">التقييم</th>
                {cols.status && <th className="px-5 py-3 font-medium">الحالة</th>}
                {cols.spread && <th className="px-5 py-3 font-medium">السبريد من</th>}
                {cols.depositBonus && <th className="px-5 py-3 font-medium">بونص الإيداع</th>}
                {cols.welcomeBonus && <th className="px-5 py-3 font-medium">بونص ترحيبي</th>}
                {cols.commission && <th className="px-5 py-3 font-medium">عمولة الوكيل</th>}
                <th className="px-5 py-3 font-medium">
                  <span className="sr-only">التفاصيل</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-fg/5 transition last:border-0 hover:bg-fg/[0.03]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <BrokerLogo broker={b} />
                      <div className="min-w-0">
                        <span className="whitespace-nowrap font-semibold text-fg">{b.name}</span>
                        {b.badges && b.badges.length > 0 && (
                          <div className="mt-1">
                            <BrokerBadges badges={b.badges} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {licenceCount(b) > 0 ? (
                      <LicenseBadges licenses={b.licenses} />
                    ) : (
                      <span className="text-xs text-slate-600">لم يُتحقَّق بعد</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <BrokerRating broker={b} />
                  </td>
                  {cols.status && (
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                  )}
                  {cols.spread && (
                    <td className="px-5 py-3.5 text-slate-300" dir="ltr">
                      {b.spread_from != null ? `${b.spread_from} نقطة` : "—"}
                    </td>
                  )}
                  {cols.depositBonus && (
                    <td className="px-5 py-3.5 text-slate-300">{b.deposit_bonus || "—"}</td>
                  )}
                  {cols.welcomeBonus && (
                    <td className="px-5 py-3.5 text-slate-300">{b.welcome_bonus || "—"}</td>
                  )}
                  {cols.commission && (
                    <td className="px-5 py-3.5 font-semibold text-brand-300">
                      {bestCommission(b) || "—"}
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-left">
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/25"
                    >
                      التفاصيل
                      <ArrowLeft className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact rows (phone / tablet). One card holding a divided list: the
          separate card per broker ran to ~130px each, so 217 of them made a
          page 35 screens long. */}
      {visible.length > 0 && (
        <ul className="card-surface divide-y divide-fg/[0.06] overflow-hidden lg:hidden">
          {visible.map((b) => (
            <li key={b.id}>
              <Link
                href={`/brokers/${b.slug}`}
                className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition hover:bg-fg/[0.03]"
              >
                <BrokerLogo broker={b} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-fg">{b.name}</span>
                    {b.status === "partnered" && (
                      <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-label={statusLabel(b.status)} />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <BrokerRating broker={b} size={13} />
                    {licenceCount(b) > 0 && <LicenseBadges licenses={b.licenses} />}
                    {b.spread_from != null && (
                      <span className="rounded-full bg-fg/5 px-2 py-0.5 text-slate-300" dir="ltr">
                        سبريد {b.spread_from}
                      </span>
                    )}
                    {b.deposit_bonus && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300">
                        <Gift className="h-3 w-3" /> إيداع {b.deposit_bonus}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-fg/15 bg-fg/[0.04] px-6 text-sm font-semibold text-fg transition hover:border-brand-400/40 hover:bg-fg/[0.08]"
          >
            عرض المزيد
            <span className="text-slate-400">({remaining} متبقية)</span>
          </button>
          <span className="text-xs text-slate-500">
            تعرض {visible.length} من {rows.length}
          </span>
        </div>
      )}

      {rows.length === 0 && (
        <div className="card-surface p-10 text-center text-sm text-slate-500">
          لا توجد شركات مطابقة لبحثك.
        </div>
      )}
      </div>
    </div>
  );
}

function BrokerLogo({ broker }: { broker: Broker }) {
  if (broker.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        loading="lazy"
        decoding="async"
        src={broker.logo_url}
        alt={broker.name}
        className="h-9 w-9 rounded-lg object-contain"
      />
    );
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-fg/5 text-brand-300">
      <Building2 className="h-4 w-4" />
    </span>
  );
}

function StatusBadge({ status }: { status: Broker["status"] }) {
  const partnered = status === "partnered";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs sm:text-[11px] font-medium",
        partnered
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-fg/5 text-slate-400"
      )}
    >
      {partnered && <BadgeCheck className="h-3 w-3" />}
      {statusLabel(status)}
    </span>
  );
}
