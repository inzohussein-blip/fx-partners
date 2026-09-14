import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

/** Bump this only when the wording below actually changes. */
const LAST_UPDATED = "2026-09-13";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Terms" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/terms",
    locale,
  });
}

export default function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  // Paragraphs per section, matching the Terms namespace.
  return (
    <LegalPage
      locale={locale}
      namespace="Terms"
      shape={[1, 2, 2, 2, 1, 1, 1, 1, 1]}
      updated={LAST_UPDATED}
    />
  );
}
