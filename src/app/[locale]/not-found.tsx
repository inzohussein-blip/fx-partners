import { ErrorState } from "@/components/error-state";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="الصفحة غير موجودة"
      message="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
    />
  );
}
