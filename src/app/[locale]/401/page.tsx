import { getTranslations, setRequestLocale } from "next-intl/server";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("Chrome");
  return { title: t("unauthorizedTitle") };
}

export default async function Unauthorized({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Chrome");
  return (
    <ErrorState
      code="401"
      title={t("unauthorizedTitle")}
      message={t("unauthorizedMessage")}
      action={
        <>
          <Button href="/login">{t("signIn")}</Button>
          <Button href="/" variant="secondary">
            {t("backHome")}
          </Button>
        </>
      }
    />
  );
}
