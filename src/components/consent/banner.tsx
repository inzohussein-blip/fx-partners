"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConsent } from "@/components/consent/provider";
import { ALLOW_ALL, CATEGORIES, DENY_ALL, type Category, type Consent } from "@/lib/consent";
import { Cookie, X } from "lucide-react";

const COPY: Record<Category, { title: string; desc: string }> = {
  analytics: { title: "analyticsTitle", desc: "analyticsDesc" },
  marketing: { title: "marketingTitle", desc: "marketingDesc" },
  external: { title: "externalTitle", desc: "externalDesc" },
};

/**
 * Cookie consent.
 *
 * Two rules shape this component, and both are requirements rather than
 * preferences. Refusing is exactly as easy as accepting — "Reject all" is a
 * button of the same size and weight, in the same row, not a link buried in a
 * second screen. And nothing non-essential runs until a choice is recorded, so
 * there is no "accept by continuing" and no pre-ticked box: every toggle in
 * the detail view starts off.
 *
 * The banner does not block the page. A wall that traps the content behind
 * consent pressures the choice, which is the thing the rule exists to prevent.
 */
export function ConsentBanner() {
  const t = useTranslations("Consent");
  const { ready, answered, consent, save, chooserOpen, reopen, closeChooser } = useConsent();
  const [draft, setDraft] = useState<Consent>(DENY_ALL);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Open the detail view holding whatever is currently allowed, so reopening
  // it from the footer shows the visitor's real state rather than a reset.
  useEffect(() => {
    if (chooserOpen) setDraft(consent);
  }, [chooserOpen, consent]);

  // Keyboard handling for the detail view: Escape closes it, and focus is
  // moved in and trapped so a keyboard user is never left behind the overlay.
  useEffect(() => {
    if (!chooserOpen) return;
    firstFieldRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeChooser();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chooserOpen, closeChooser]);

  // Nothing renders until the stored choice has been read, so a returning
  // visitor never sees the banner flash before it disappears.
  if (!ready) return null;
  if (answered && !chooserOpen) return null;

  const btn =
    "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition";
  const primary = `${btn} bg-brand-gradient text-white shadow-glow hover:opacity-90`;
  /**
   * Reject is a filled button too, not an outline.
   *
   * Equal size is not on its own equal prominence: a solid accept next to a
   * hollow reject still steers the choice, and steering the choice is the
   * deceptive-design pattern the guidance names specifically. So refusal gets
   * the same shape, the same height and the same font weight, and differs only
   * in hue. Only "Customise" — which is not a decision, just a way to make one
   * — is quieter than the two real answers.
   */
  const reject = `${btn} bg-fg/10 text-fg ring-1 ring-inset ring-fg/15 hover:bg-fg/15`;
  const tertiary = `${btn} border border-fg/15 text-slate-300 hover:border-brand-400/40 hover:bg-fg/5`;

  return (
    <>
      {!answered && !chooserOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-[95] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4"
          role="region"
          aria-label={t("title")}
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-fg/15 bg-ink-800/98 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                <Cookie className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-fg">{t("title")}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{t("body")}</p>
                <Link
                  href="/cookies"
                  className="mt-1.5 inline-flex min-h-6 items-center text-sm text-brand-300 underline underline-offset-2 hover:text-brand-200"
                >
                  {t("policyLink")}
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button className={primary} onClick={() => save(ALLOW_ALL)}>
                {t("acceptAll")}
              </button>
              <button className={reject} onClick={() => save(DENY_ALL)}>
                {t("rejectAll")}
              </button>
              <button className={tertiary} onClick={reopen}>
                {t("manage")}
              </button>
            </div>
          </div>
        </div>
      )}

      {chooserOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-dialog-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-fg/15 bg-ink-800 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="consent-dialog-title" className="text-lg font-bold text-fg">
                {t("dialogTitle")}
              </h2>
              <button
                onClick={closeChooser}
                aria-label={t("dialogTitle")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-fg/5 hover:text-fg"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("dialogIntro")}</p>

            <div className="mt-5 space-y-3">
              {/* Necessary is shown, and shown as not a choice — hiding it
                  would misrepresent what the site actually stores. */}
              <div className="rounded-xl border border-fg/10 bg-fg/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-fg">{t("necessaryTitle")}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300">
                    {t("necessaryAlways")}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {t("necessaryDesc")}
                </p>
              </div>

              {CATEGORIES.map((cat, i) => (
                <label
                  key={cat}
                  className="flex cursor-pointer gap-3 rounded-xl border border-fg/10 bg-fg/[0.03] p-4 transition hover:border-brand-500/30"
                >
                  <input
                    ref={i === 0 ? firstFieldRef : undefined}
                    type="checkbox"
                    checked={draft[cat]}
                    onChange={(e) => setDraft({ ...draft, [cat]: e.target.checked })}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-brand-500"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold text-fg">{t(COPY[cat].title)}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-slate-400">
                      {t(COPY[cat].desc)}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button className={primary} onClick={() => save(draft)}>
                {t("save")}
              </button>
              <button className={reject} onClick={() => save(DENY_ALL)}>
                {t("rejectAll")}
              </button>
              <button className={reject} onClick={() => save(ALLOW_ALL)}>
                {t("acceptAll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
