import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { BrokerBadges } from "@/components/brokers/broker-badges";
import { isRated, linkHref, regulatorMeta, statusLabel, type Broker } from "@/lib/brokers";
import type { BestForCategory } from "@/lib/best-for";
import { Building2, ExternalLink, ArrowLeft } from "lucide-react";

/**
 * The ranked list on a "best for X" page.
 *
 * Each row leads with the fact that put the broker in this position — the
 * minimum deposit on the beginners page, the spread on the scalping page —
 * rather than with the star rating. The rating is the tie-breaker, not the
 * ordering, and showing it as the headline would misrepresent why the list is
 * in the order it is in.
 */
export async function BestForList({
  category,
  brokers,
  locale,
}: {
  category: BestForCategory;
  brokers: Broker[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "BestFor" });

  return (
    <ol className="mt-8 space-y-4">
      {brokers.map((b, i) => {
        const fact = category.fact(b);
        const url = (b.broker_links ?? [])[0];
        const licences = (b.licenses ?? []).map((k) => regulatorMeta(k)).filter(Boolean);

        return (
          <li key={b.id} className="card-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              {/* Position. The number is the point of the page, so it is the
                  first thing in the row and in the reading order. */}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-sm font-extrabold text-brand-300">
                {t("position", { n: i + 1 })}
              </span>

              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-fg/5">
                  {b.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      loading="lazy"
                      decoding="async"
                      src={b.logo_url}
                      alt={b.name}
                      className="h-full w-full rounded-xl object-contain p-1.5"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-brand-300" aria-hidden />
                  )}
                </span>

                <div className="min-w-0">
                  <Link
                    href={`/brokers/${b.slug}`}
                    className="text-lg font-bold text-fg hover:text-brand-200"
                  >
                    {b.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {isRated(b) ? (
                      <span className="flex items-center gap-1.5">
                        <Stars value={b.rating} />
                        <span className="text-xs text-slate-500" dir="ltr">
                          {b.rating.toFixed(1)}
                        </span>
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-500">{statusLabel(b.status)}</span>
                  </div>
                  <div className="mt-2">
                    <BrokerBadges badges={b.badges} />
                  </div>
                </div>
              </div>

              {/* The ranking fact, given the visual weight the position implies. */}
              {fact && (
                <div className="shrink-0 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] px-4 py-2.5 text-center">
                  <div className="text-xs text-slate-400">
                    {t(
                      fact.key === "minDeposit"
                        ? "factMinDeposit"
                        : fact.key === "spreadFrom"
                          ? "factSpreadFrom"
                          : "factLicenceCount"
                    )}
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold text-brand-200" dir="ltr">
                    {fact.value}
                  </div>
                </div>
              )}
            </div>

            {licences.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-fg/5 pt-3">
                {licences.map((r, k) => (
                  <span key={k} className="text-xs text-emerald-300">
                    {r!.flag} {r!.label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
              {url && (
                <a
                  href={linkHref(url)}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  className="btn-gradient inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  {b.name}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              )}
              <Link
                href={`/brokers/${b.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-fg/15 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-brand-400/50 hover:bg-fg/5"
              >
                {t("viewBroker")}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
