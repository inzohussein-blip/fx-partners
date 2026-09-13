"use client";

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
  return (
    <>
      <ErrorReporter error={error} />
      <ErrorState
        code="500"
        title="حدث خطأ غير متوقّع"
        message="نعتذر، حدث خطأ ما من جهتنا. حاول مرة أخرى أو عُد إلى الصفحة الرئيسية."
        action={
          <>
            <Button onClick={() => reset()}>إعادة المحاولة</Button>
            <Button href="/" variant="secondary">
              العودة للرئيسية
            </Button>
          </>
        }
      />
    </>
  );
}
