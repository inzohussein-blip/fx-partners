"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/error-state";
import { ErrorReporter } from "@/components/error-reporter";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Chrome");
  return (
    <>
      <ErrorReporter error={error} />
      <ErrorState
        code="500"
        title={t("errorTitle")}
        message={t("errorMessage")}
        action={
          <>
            <Button onClick={() => reset()}>{t("retry")}</Button>
            <Button href="/" variant="secondary">
              {t("backHome")}
            </Button>
          </>
        }
      />
    </>
  );
}
