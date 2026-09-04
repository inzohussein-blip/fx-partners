"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to logging in production.
    console.error(error);
  }, [error]);

  return (
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
  );
}
