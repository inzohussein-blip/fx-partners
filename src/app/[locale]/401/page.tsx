import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "غير مصرّح" };

export default function Unauthorized() {
  return (
    <ErrorState
      code="401"
      title="غير مصرّح"
      message="تحتاج إلى تسجيل الدخول للوصول إلى هذه الصفحة."
      action={
        <>
          <Button href="/login">تسجيل الدخول</Button>
          <Button href="/" variant="secondary">
            العودة للرئيسية
          </Button>
        </>
      }
    />
  );
}
