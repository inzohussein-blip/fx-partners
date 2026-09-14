import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CookieTables } from "@/components/consent/cookie-tables";

/** Bump only when the wording or the inventory below actually changes. */
const LAST_UPDATED = "2026-09-14";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cookies",
    locale,
  });
}

export default async function CookiePolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Cookies" });
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
          <p className="mt-6 text-sm leading-relaxed text-slate-300">{t("intro")}</p>

          <CookieTables />
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
