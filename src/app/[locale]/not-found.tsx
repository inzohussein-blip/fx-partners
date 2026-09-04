import { ErrorState } from "@/components/error-state";
import { Home, Scale, Wrench, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="الصفحة غير موجودة"
      message="عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
      links={[
        { href: "/", label: "الرئيسية", icon: Home },
        { href: "/compare", label: "قارن الشركات", icon: Scale },
        { href: "/tools", label: "الأدوات", icon: Wrench },
        { href: "/contact", label: "اتصل بنا", icon: MessageCircle },
      ]}
    />
  );
}
