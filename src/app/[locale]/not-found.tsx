import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/error-state";
import { Home, Scale, Wrench, MessageCircle } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("Chrome");
  return (
    <ErrorState
      code="404"
      title={t("notFoundTitle")}
      message={t("notFoundMessage")}
      links={[
        { href: "/", label: t("home"), icon: Home },
        { href: "/compare", label: t("compareBrokers"), icon: Scale },
        { href: "/tools", label: t("tools"), icon: Wrench },
        { href: "/contact", label: t("contact"), icon: MessageCircle },
      ]}
    />
  );
}
