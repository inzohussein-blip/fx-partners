import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { isRated, linkHref, statusLabel, type Broker } from "@/lib/brokers";
import { Building2, Trophy, BadgeCheck, ExternalLink, ArrowLeft, ChevronDown } from "lucide-react";

/** How many brokers the sidebar shows: the featured one plus six rows. */
const SHOWN = 7;

/**
 * Below this many *rated* brokers the sidebar is hidden. It is headed "ranked
 * by trader ratings", so counting all brokers let it render a podium of
 * unrated ones — every row "not rated yet" — while squeezing the directory
 * beside it into a narrow column on desktop.
 */
const MIN_TO_SHOW = 3;

export function shouldShowRanking(brokers: Broker[]): boolean {
  return brokers.filter(isRated).length >= MIN_TO_SHOW;
}

/**
 * Ranking order.
 *
 * Rated brokers first — a broker with real reviews outranks one with none,
 * whatever their stored rating — then by rating and review count. An unrated
 * broker still appears if the top of the list is thin; it simply sits below
 * everyone the community has actually scored.
 */
function ranked(brokers: Broker[]): Broker[] {
  return [...brokers].sort((a, b) => {
    const ar = isRated(a);
    const br = isRated(b);
    if (ar !== br) return ar ? -1 : 1;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews_count - a.reviews_count;
  });
}

/** Broker logo, or its initial when there is none — matching the rest of the site. */
function Logo({ broker, size }: { broker: Broker; size: "sm" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-xl" : "h-9 w-9 rounded-lg";
  return (
    <span className={`grid ${box} shrink-0 place-items-center bg-fg/5`}>
      {broker.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          decoding="async"
          src={broker.logo_url}
          alt={broker.name}
          className="h-full w-full rounded-[inherit] object-contain p-1.5"
        />
      ) : (
        <Building2 className={size === "lg" ? "h-6 w-6 text-brand-300" : "h-4 w-4 text-brand-300"} aria-hidden />
      )}
    </span>
  );
}

/**
 * The sticky "top brokers" sidebar on the comparison page.
 *
 * A persistent, ranked reference that stays in view while the directory
 * scrolls beside it. On a phone it is not a squeezed column: it becomes a
 * native <details> panel above the directory that folds away with one tap.
 * The ordering is the same the whole site uses, and an unrated broker is shown
 * honestly rather than as a zero.
 */
export async function BrokerRanking({
  brokers,
  locale,
}: {
  brokers: Broker[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Ranking" });
  const list = ranked(brokers).slice(0, SHOWN);
  if (list.length === 0) return null;

  const [featured, ...rows] = list;
  const featuredLink = (featured.broker_links ?? [])[0];

  const medal = (rank: number) =>
    rank === 2
      ? "bg-gradient-to-br from-[#e6ecf3] to-[#b9c4d2] text-[#2a3442]"
      : rank === 3
        ? "bg-gradient-to-br from-[#e8b489] to-[#c98a54] text-[#3a2110]"
        : "bg-fg/5 text-slate-400 border border-fg/10";

  return (
    <aside className="order-first lg:order-none lg:sticky lg:top-24">
      <details open className="ranking-panel card-surface overflow-hidden rounded-2xl">
        <summary className="flex items-center justify-between gap-3 border-b border-fg/10 p-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fg/10 bg-brand-500/10 px-2.5 py-1 text-xs sm:text-[11px] font-semibold text-brand-200">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              {t("badge")}
            </span>
            <h2 className="mt-2 text-base font-bold text-fg">{t("title")}</h2>
            <p className="text-xs text-slate-500">{t("subtitle")}</p>
          </div>
          <ChevronDown
            className="ranking-chevron h-5 w-5 shrink-0 text-slate-400 lg:hidden"
            aria-hidden
          />
        </summary>

        <div className="ranking-body flex flex-col gap-2.5 p-3.5">
          {/* Featured #1 */}
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-ink-900/40 p-4 shadow-glow">
            <span className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient" aria-hidden />
            <div className="flex items-center gap-3">
              <Logo broker={featured} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/brokers/${featured.slug}`}
                    className="truncate font-bold text-fg hover:text-brand-200"
                  >
                    {featured.name}
                  </Link>
                  {featured.status === "partnered" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs sm:text-[10px] font-semibold text-emerald-300">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      {t("verified")}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs sm:text-[11px] text-slate-500">
                  {statusLabel(featured.status)}
                </div>
              </div>
              <div className="shrink-0 text-center">
                {isRated(featured) ? (
                  <>
                    <div className="text-2xl font-extrabold text-fg" dir="ltr">
                      {featured.rating.toFixed(1)}
                    </div>
                    <div className="text-xs sm:text-[10px] text-slate-500">{t("outOf")}</div>
                    <Stars value={featured.rating} size={13} className="mt-1" />
                  </>
                ) : (
                  <div className="text-xs font-medium text-slate-500">{t("unrated")}</div>
                )}
              </div>
            </div>

            <div className="mt-3.5 flex gap-2">
              {featuredLink ? (
                <a
                  href={linkHref(featuredLink)}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  className="btn-gradient inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  {t("openAccount")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
              <Link
                href={`/brokers/${featured.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-fg/15 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-fg/5"
              >
                {t("fullReview")}
              </Link>
            </div>
          </div>

          {/* Compact rows */}
          {rows.map((b, i) => {
            const rank = i + 2;
            return (
              <Link
                key={b.id}
                href={`/brokers/${b.slug}`}
                className="flex items-center gap-3 rounded-xl border border-fg/[0.07] bg-ink-900/30 p-2.5 transition hover:border-brand-400/50 hover:-translate-x-0.5"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs sm:text-[11px] font-extrabold ${medal(rank)}`}
                >
                  {rank}
                </span>
                <Logo broker={b} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-fg">{b.name}</div>
                  <div className="truncate text-xs sm:text-[10px] text-slate-500">
                    {statusLabel(b.status)}
                  </div>
                </div>
                <div className="shrink-0 text-end">
                  {isRated(b) ? (
                    <>
                      <div className="text-sm font-extrabold text-fg" dir="ltr">
                        {b.rating.toFixed(1)}
                      </div>
                      <Stars value={b.rating} size={10} className="mt-0.5" />
                    </>
                  ) : (
                    <span className="text-xs sm:text-[10px] text-slate-500">{t("unrated")}</span>
                  )}
                </div>
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-600 rtl:rotate-0 ltr:rotate-180" aria-hidden />
              </Link>
            );
          })}
        </div>

        <div className="ranking-foot border-t border-fg/10 p-4">
          <p className="text-xs sm:text-[11px] leading-relaxed text-slate-500">{t("note")}</p>
          <Link
            href="/best"
            className="mt-3 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
          >
            {t("viewAll")}
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
          </Link>
        </div>
      </details>
    </aside>
  );
}
