"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
      aria-label={other === "en" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe className="h-4 w-4" />
      <span>{other === "en" ? "EN" : "ع"}</span>
    </button>
  );
}
