"use client";

import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQueryStates, parseAsString } from "nuqs";
import { Link } from "@/i18n/navigation";
import { Stars } from "@/components/brokers/stars";
import { isRated, linkHref, statusLabel, type Broker } from "@/lib/brokers";
import { askableQuestions, matchBrokers, mostRestrictive, type AnswerMap } from "@/lib/broker-finder";
import { QUESTIONS } from "@/lib/broker-finder";
import { Building2, ExternalLink, ArrowLeft, SlidersHorizontal, Info, RotateCcw } from "lucide-react";

/**
 * The guided finder.
 *
 * Answers live in the URL rather than component state, which is what makes a
 * narrowed result something a visitor can bookmark, send to someone, or reach
 * again with the back button. It also means a support conversation can be
 * "open this link" rather than "pick these five things".
 *
 * Filtering happens in the browser over the already-loaded broker list. The
 * list is small and the alternative — a round trip per answer — would make a
 * five-question widget feel slow for no benefit.
 */
export function BrokerFinder({ brokers }: { brokers: Broker[] }) {
  const t = useTranslations("Finder");
  const headingId = useId();

  const questions = useMemo(() => askableQuestions(brokers), [brokers]);

  const [answers, setAnswers] = useQueryStates(
    Object.fromEntries(
      QUESTIONS.map((q) => [q.id, parseAsString.withOptions({ clearOnDefault: true })])
    ),
    { history: "replace" }
  );

  const current: AnswerMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, v ?? undefined])
      ) as AnswerMap,
    [answers]
  );

  const results = useMemo(() => matchBrokers(brokers, current), [brokers, current]);
  const blocker = useMemo(
    () => (results.length === 0 ? mostRestrictive(brokers, current) : null),
    [results.length, brokers, current]
  );

  const hasAnswers = Object.values(current).some((v) => v && v !== "any");
  const countryAsked = questions.some((q) => q.id === "country");

  // Nothing to filter, so nothing to show. The compare page below it still
  // renders the directory, so the visitor is not left with an empty screen.
  if (brokers.length === 0) return null;
  if (questions.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-slate-400">{t("noData")}</div>
    );
  }

  const selectCls =
    "w-full min-h-11 rounded-xl border border-fg/10 bg-ink-900/60 px-4 py-2.5 text-sm text-fg " +
    "focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <section className="card-surface p-6 sm:p-8" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </span>
          <h2 id={headingId} className="mt-3 text-xl font-bold text-fg sm:text-2xl">
            {t("title")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t("subtitle")}</p>
        </div>

        {hasAnswers && (
          <button
            onClick={() =>
              setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, null])))
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-fg/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-brand-400/50 hover:bg-fg/5"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("reset")}
          </button>
        )}
      </div>

      {/* Questions. Only the ones the data can answer are rendered at all. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((q) => {
          const options = q.options(brokers);
          const id = `finder-${q.id}`;
          return (
            <div key={q.id}>
              <label htmlFor={id} className="mb-1.5 block text-sm text-slate-300">
                {t(q.labelKey)}
              </label>
              <select
                id={id}
                className={selectCls}
                value={current[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers({ [q.id]: e.target.value || null } as Record<string, string | null>)
                }
              >
                <option value="">{t("anyOption")}</option>
                {options
                  .filter((o) => o.value !== "any")
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
              </select>
            </div>
          );
        })}
      </div>

      {countryAsked && (
        <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("countryCaveat")}
        </p>
      )}

      {/* Results. `aria-live` so a screen reader hears the count change when an
          answer changes, rather than silently re-rendering beneath them. */}
      <div className="mt-6 border-t border-fg/5 pt-5">
        <p className="text-sm font-semibold text-fg" aria-live="polite">
          {t("resultsCount", { count: results.length })}
        </p>

        {results.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4">
            <p className="text-sm font-semibold text-amber-300">{t("emptyTitle")}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              {/* Naming the one answer to change beats "no results, try again". */}
              {blocker
                ? t("emptyHint", { question: t(QUESTIONS.find((q) => q.id === blocker)!.labelKey) })
                : t("emptyHintNone")}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {results.slice(0, 5).map((b) => {
              const link = (b.broker_links ?? [])[0];
              return (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-fg/[0.07] bg-fg/[0.02] p-3.5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fg/5">
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
                      <Building2 className="h-5 w-5 text-brand-300" aria-hidden />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="font-bold text-fg hover:text-brand-200"
                    >
                      {b.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {isRated(b) && (
                        <span className="flex items-center gap-1.5">
                          <Stars value={b.rating} />
                          <span className="text-xs text-slate-500" dir="ltr">
                            {b.rating.toFixed(1)}
                          </span>
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{statusLabel(b.status)}</span>
                      {typeof b.min_deposit === "number" && (
                        <span className="text-xs text-slate-500" dir="ltr">
                          ${b.min_deposit}
                        </span>
                      )}
                    </div>
                  </div>

                  {link ? (
                    <a
                      href={linkHref(link)}
                      target="_blank"
                      rel="nofollow noopener noreferrer sponsored"
                      className="btn-gradient inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                    >
                      {b.name}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={`/brokers/${b.slug}`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-fg/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-fg/5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" aria-hidden />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 text-xs leading-relaxed text-slate-500">{t("unverifiedNote")}</p>
      </div>
    </section>
  );
}
