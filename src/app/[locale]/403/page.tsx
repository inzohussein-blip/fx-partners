import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "ممنوع الوصول" };

export default function Forbidden() {
  return (
    <ErrorState
      code="403"
      title="ممنوع الوصول"
      message="ليست لديك الصلاحية للوصول إلى هذه الصفحة."
      action={
        <>
          <Button href="/dashboard">لوحة التحكم</Button>
          <Button href="/" variant="secondary">
            العودة للرئيسية
          </Button>
        </>
      }
    />
  );
}
