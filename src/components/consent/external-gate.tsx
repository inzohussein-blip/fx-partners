"use client";

import { useTranslations } from "next-intl";
import { useConsent } from "@/components/consent/provider";
import { Link } from "@/i18n/navigation";
import { EyeOff } from "lucide-react";

/**
 * Wraps a block that talks to a third party, and refuses to render it until
 * the visitor has allowed external content.
 *
 * Loading a TradingView widget or calling Binance from the browser sends the
 * visitor's IP address to that company before they have agreed to anything.
 * Rather than drop the feature, the space is kept and a one-tap way to turn it
 * on is offered in place of the embed — so the visitor knows something is
 * there, knows why it is off, and can change it without hunting for a setting.
 */
export function ExternalGate({
  /** Reserve the embed's height so allowing it causes no layout jump. */
  minHeight,
  children,
}: {
  minHeight?: number;
  children: React.ReactNode;
}) {
  const t = useTranslations("Consent");
  const { ready, consent, reopen } = useConsent();

  // Render nothing at all until the stored answer has been read — showing the
  // placeholder first and swapping in the embed reads as a broken page.
  if (!ready) {
    return <div style={minHeight ? { minHeight } : undefined} aria-hidden />;
  }
  if (consent.external) return <>{children}</>;

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-fg/15 bg-fg/[0.02] p-8 text-center"
      style={minHeight ? { minHeight } : undefined}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-fg/5 text-slate-400">
        <EyeOff className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-fg">{t("blockedTitle")}</p>
      <p className="max-w-sm text-sm leading-relaxed text-slate-400">{t("blockedBody")}</p>
      <button
        onClick={reopen}
        className="mt-1 inline-flex min-h-11 items-center rounded-xl border border-brand-500/40 px-5 py-2.5 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/10"
      >
        {t("blockedAction")}
      </button>
      <Link
        href="/cookies"
        className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300"
      >
        {t("policyLink")}
      </Link>
    </div>
  );
}
