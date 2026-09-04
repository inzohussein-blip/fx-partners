"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { UserCheck, FileText, Type, Building2, CalendarClock, Megaphone } from "lucide-react";

const tabs = [
  { href: "/dashboard/admin", label: "الاعتمادات", icon: UserCheck, exact: true },
  { href: "/dashboard/admin/posts", label: "المنشورات", icon: FileText },
  { href: "/dashboard/admin/content", label: "المحتوى", icon: Type },
  { href: "/dashboard/admin/partners", label: "الشركاء", icon: Building2 },
  { href: "/dashboard/admin/meetings", label: "الاجتماعات", icon: CalendarClock },
  { href: "/dashboard/admin/announcements", label: "الإعلانات", icon: Megaphone },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 border-b border-white/5 pb-px">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition",
              active
                ? "border-brand-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
