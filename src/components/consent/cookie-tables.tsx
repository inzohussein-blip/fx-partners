"use client";

import { useLocale, useTranslations } from "next-intl";
import { useConsent } from "@/components/consent/provider";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from "@/lib/consent";
import { SlidersHorizontal } from "lucide-react";

type Category = "catNecessary" | "catAnalytics" | "catMarketing" | "catExternal";
type Row = { name: string; purposeAr: string; purposeEn: string; cat: Category; days?: number; session?: boolean };

/**
 * The actual inventory.
 *
 * Every row here corresponds to something real in this codebase — the names
 * are the literal keys the code writes. A cookie policy listing categories a
 * site does not use, or omitting one it does, is worse than none: it is a
 * statement the site can be held to and cannot support. When a key is added or
 * removed in the code, this list changes with it.
 */
const COOKIES: Row[] = [
  {
    name: CONSENT_COOKIE,
    purposeAr: "يحفظ اختيارك في هذه الصفحة حتى لا نسألك في كل زيارة.",
    purposeEn: "Remembers the choice you made here, so we do not ask again every visit.",
    cat: "catNecessary",
    days: CONSENT_MAX_AGE_DAYS,
  },
  {
    name: "sb-<project>-auth-token",
    purposeAr: "جلسة تسجيل الدخول لدى Supabase — تُوضع فقط بعد تسجيل دخولك.",
    purposeEn: "Your Supabase sign-in session — set only after you sign in.",
    cat: "catNecessary",
    days: 7,
  },
  {
    name: "NEXT_LOCALE",
    purposeAr: "لغة العرض التي اخترتها (العربية أو الإنجليزية).",
    purposeEn: "The display language you picked (Arabic or English).",
    cat: "catNecessary",
    days: 365,
  },
  {
    name: "fxp_ref",
    purposeAr:
      "يحفظ رمز الوكيل الذي وصلت عبر رابطه، حتى تُنسب إليه العمولة إن فتحت حساباً لاحقاً. لا يُوضع إلا بموافقتك على «نسب الإحالة».",
    purposeEn:
      "Remembers which agent's link you arrived through, so their commission is credited if you open an account later. Set only if you allow “referral attribution”.",
    cat: "catMarketing",
    days: 30,
  },
];

const STORAGE: Row[] = [
  { name: "fxp-theme", purposeAr: "الوضع الفاتح أو الداكن الذي اخترته.", purposeEn: "The light or dark theme you chose.", cat: "catNecessary" },
  { name: "fx_voter_key", purposeAr: "معرّف عشوائي لهذا المتصفّح، يمنع تكرار تصويتك على نفس المنشور. لا يرتبط باسمك ولا ببريدك.", purposeEn: "A random identifier for this browser that stops the same post being voted on twice. Not linked to your name or email.", cat: "catNecessary" },
  { name: "fx_board_name", purposeAr: "الاسم الذي كتبته آخر مرة في لوحة النقاش، حتى لا تعيد كتابته.", purposeEn: "The name you last used on the discussion board, so you need not retype it.", cat: "catNecessary" },
  { name: "fx_campaign_dismissed", purposeAr: "العروض التي أغلقتها، حتى لا تظهر لك مجدداً.", purposeEn: "Promotions you dismissed, so they do not come back.", cat: "catNecessary" },
  { name: "fx_ann_seen_at", purposeAr: "آخر مرة اطّلعت فيها على الإعلانات، لتمييز الجديد.", purposeEn: "When you last read announcements, so new ones can be marked.", cat: "catNecessary" },
  { name: "fx_tour_done_v1", purposeAr: "أنك أنهيت الجولة التعريفية في لوحة التحكم.", purposeEn: "That you finished the dashboard product tour.", cat: "catNecessary" },
  { name: "fxp_res_unlock_<id>", purposeAr: "الأدوات المجانية التي فتحتها بالفعل.", purposeEn: "Which free tools you have already unlocked.", cat: "catNecessary" },
  { name: "fxp_edit_mode", purposeAr: "وضع تحرير الصفحة للمشرفين فقط (تخزين جلسة).", purposeEn: "Page edit mode, for administrators only (session storage).", cat: "catNecessary", session: true },
];

const THIRD_PARTIES = [
  { name: "Vercel Analytics & Speed Insights", cat: "catAnalytics" as Category, href: "https://vercel.com/legal/privacy-policy" },
  { name: "TradingView", cat: "catExternal" as Category, href: "https://www.tradingview.com/privacy-policy/" },
  { name: "Binance (market prices)", cat: "catExternal" as Category, href: "https://www.binance.com/en/privacy" },
  { name: "jsDelivr / currency-api (exchange rates)", cat: "catExternal" as Category, href: "https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net" },
];

export function CookieTables() {
  const t = useTranslations("Cookies");
  const { reopen } = useConsent();
  // The purpose text lives in this file rather than the catalogue because it
  // has to be edited in the same breath as the key it describes.
  const locale = useLocale();
  const purpose = (r: Row) => (locale === "en" ? r.purposeEn : r.purposeAr);

  const badge = (cat: Category) => {
    const tone =
      cat === "catNecessary"
        ? "bg-emerald-500/15 text-emerald-300"
        : cat === "catAnalytics"
          ? "bg-blue-500/15 text-blue-300"
          : cat === "catMarketing"
            ? "bg-amber-500/15 text-amber-300"
            : "bg-rose-500/15 text-rose-300";
    return (
      <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${tone}`}>
        {t(cat)}
      </span>
    );
  };

  const lifetime = (r: Row) =>
    r.session ? t("durSession") : r.days ? t("days", { n: r.days }) : t("durPersistent");

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-fg">{t("tableName")}</h2>
        {/* Tables get their own scroller so a narrow phone scrolls the table
            and never the whole page sideways. */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-fg/10 text-xs text-slate-500">
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("tableName")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("tablePurpose")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("tableCategory")}</th>
                <th scope="col" className="py-2 text-start font-medium">{t("tableDuration")}</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((r) => (
                <tr key={r.name} className="border-b border-fg/5 align-top">
                  <td className="py-3 pe-3 font-mono text-xs text-brand-200" dir="ltr">{r.name}</td>
                  <td className="py-3 pe-3 leading-relaxed text-slate-300">{purpose(r)}</td>
                  <td className="py-3 pe-3">{badge(r.cat)}</td>
                  <td className="py-3 whitespace-nowrap text-slate-400">{lifetime(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg">{t("storageTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("storageIntro")}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b border-fg/10 text-xs text-slate-500">
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("tableName")}</th>
                <th scope="col" className="py-2 pe-3 text-start font-medium">{t("tablePurpose")}</th>
                <th scope="col" className="py-2 text-start font-medium">{t("tableDuration")}</th>
              </tr>
            </thead>
            <tbody>
              {STORAGE.map((r) => (
                <tr key={r.name} className="border-b border-fg/5 align-top">
                  <td className="py-3 pe-3 font-mono text-xs text-brand-200" dir="ltr">{r.name}</td>
                  <td className="py-3 pe-3 leading-relaxed text-slate-300">{purpose(r)}</td>
                  <td className="py-3 whitespace-nowrap text-slate-400">{lifetime(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg">{t("thirdTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("thirdIntro")}</p>
        <ul className="mt-4 space-y-2">
          {THIRD_PARTIES.map((p) => (
            <li key={p.name} className="flex flex-wrap items-center gap-2 text-sm">
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-300 underline underline-offset-2 hover:text-brand-200"
              >
                {p.name}
              </a>
              {badge(p.cat)}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-fg">{t("changeTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{t("changeBody")}</p>
        <button
          onClick={reopen}
          className="btn-gradient mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {t("changeButton")}
        </button>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg">{t("noAdsTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("noAdsBody")}</p>
      </section>
    </div>
  );
}
