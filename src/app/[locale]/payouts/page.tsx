import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Info, Landmark } from "lucide-react";

/** Bump only when the wording below actually changes. */
const LAST_UPDATED = "2026-09-14";

/** Paragraph count per numbered section, matching the Payouts namespace. */
const SHAPE = [2, 2, 3, 2, 1, 1, 1] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Payouts" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/payouts",
    locale,
  });
}

export default async function PayoutsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Payouts" });
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar", {
    dateStyle: "long",
  }).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  return (
    <>
      <SiteHeader />
      <section className="py-14">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: t("crumb") }]} />
          <h1 className="mt-6 text-3xl font-extrabold text-fg sm:text-4xl">{t("h1")}</h1>
          <p className="mt-3 text-sm text-slate-500">{t("lastUpdated", { date })}</p>

          {/* Answered first and plainly, because "where is your refund policy"
              is the question a reader arrives with, and the honest answer is
              that nothing here is sold to them. */}
          <div className="card-surface mt-8 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Info className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
              {t("noRefundTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{t("noRefundBody")}</p>
          </div>

          <div className="card-surface mt-4 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Landmark className="h-5 w-5 shrink-0 text-brand-300" aria-hidden />
              {t("brokerDepositsTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {t("brokerDepositsBody")}
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {SHAPE.map((paragraphs, i) => {
              const n = i + 1;
              return (
                <section key={n}>
                  <h2 className="text-lg font-semibold text-fg">{t(`s${n}Title`)}</h2>
                  {Array.from({ length: paragraphs }, (_, j) => (
                    <p key={j} className="mt-2 text-sm leading-relaxed text-slate-400">
                      {t(`s${n}p${j + 1}`)}
                    </p>
                  ))}
                </section>
              );
            })}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
