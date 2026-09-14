"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeBroker } from "@/lib/actions/brokers";
import { Link } from "@/i18n/navigation";
import { Bell, Check, Loader2 } from "lucide-react";

export function BrokerSubscribe({
  brokerId,
  brokerName,
}: {
  brokerId: string;
  brokerName: string;
}) {
  const t = useTranslations("FormConsent");
  const checkboxId = useId();
  const [email, setEmail] = useState("");
  /**
   * The one form on the site that needs a real tick-box.
   *
   * Everywhere else the person is asking us for something and the notice
   * simply tells them what happens to what they typed. This is a standing
   * subscription to marketing email about a broker's offers, where consent is
   * the actual basis — so it starts unticked, submitting without it is
   * refused, and the wording says what they will receive and that they can
   * stop it.
   */
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError(t("subscribeRequired"));
      return;
    }
    setBusy(true);
    const res = await subscribeBroker({ brokerId, email });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "تعذّر الاشتراك.");
  }

  return (
    <div className="card-surface relative overflow-hidden p-6">
      <div className="hero-glow absolute inset-0 opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/20">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-fg">تنبيهات عروض {brokerName}</h3>
            <p className="text-xs text-slate-400">
              اشترك لتصلك التحديثات فور تغيّر البونص أو الشروط.
            </p>
          </div>
        </div>

        {done ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
            <Check className="h-4 w-4" /> تم اشتراكك! سنراسلك عند أي تحديث.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                aria-label="بريدك الإلكتروني"
                className="flex-1 rounded-xl border border-fg/10 bg-ink-900/60 px-4 py-3 text-fg placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "اشترك"}
              </button>
            </div>
            <label
              htmlFor={checkboxId}
              className="mt-3 flex cursor-pointer gap-2.5 text-xs leading-relaxed text-slate-400"
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
              />
              <span>
                {t("subscribeCheckbox")}{" "}
                <Link
                  href="/privacy"
                  className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
                >
                  {t("privacyLink")}
                </Link>
              </span>
            </label>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
