"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  UserCheck,
  FileText,
  Type,
  Building2,
  CalendarClock,
  CalendarDays,
  Megaphone,
  Scale,
  TrendingUp,
  Crosshair,
  Download,
} from "lucide-react";

type Tab = { href: string; label: string; icon: typeof UserCheck; exact?: boolean };

const groups: { label: string; tabs: Tab[] }[] = [
  {
    label: "الوكلاء والطلبات",
    tabs: [
      { href: "/dashboard/admin", label: "الاعتمادات", icon: UserCheck, exact: true },
      { href: "/dashboard/admin/meetings", label: "الاجتماعات", icon: CalendarClock },
    ],
  },
  {
    label: "الشركات",
    tabs: [
      { href: "/dashboard/admin/partners", label: "الشركاء", icon: Building2 },
      { href: "/dashboard/admin/brokers", label: "دليل الشركات", icon: Scale },
    ],
  },
  {
    label: "التسويق",
    tabs: [
      { href: "/dashboard/admin/signals", label: "التوصيات", icon: TrendingUp },
      { href: "/dashboard/admin/campaigns", label: "العروض", icon: Crosshair },
      { href: "/dashboard/admin/resources", label: "أدوات مجانية", icon: Download },
    ],
  },
  {
    label: "المحتوى",
    tabs: [
      { href: "/dashboard/admin/posts", label: "المنشورات", icon: FileText },
      { href: "/dashboard/admin/content", label: "النصوص", icon: Type },
      { href: "/dashboard/admin/announcements", label: "الإعلانات", icon: Megaphone },
      { href: "/dashboard/admin/events", label: "التقويم", icon: CalendarDays },
    ],
  },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 border-b border-white/5 pb-4">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            {group.label}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.tabs.map((tab) => {
              const active = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
