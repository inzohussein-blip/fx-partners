import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

/** Bump this only when the wording below actually changes. */
const LAST_UPDATED = "2026-09-14";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return pageMeta({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/privacy",
    locale,
  });
}

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  // Paragraphs per section, matching the Privacy namespace.
  return (
    <LegalPage
      locale={locale}
      namespace="Privacy"
      shape={[2, 6, 5, 7, 1, 4, 1, 3, 1, 1, 1, 1]}
      updated={LAST_UPDATED}
    />
  );
}
