import { getTranslations, setRequestLocale } from "next-intl/server";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("Chrome");
  return { title: t("forbiddenTitle") };
}

export default async function Forbidden({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Chrome");
  return (
    <ErrorState
      code="403"
      title={t("forbiddenTitle")}
      message={t("forbiddenMessage")}
      action={
        <>
          <Button href="/dashboard">{t("dashboard")}</Button>
          <Button href="/" variant="secondary">
            {t("backHome")}
          </Button>
        </>
      }
    />
  );
}
