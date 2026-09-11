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
  Share2,
  Images,
  MessagesSquare,
  MousePointerClick,
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
      { href: "/dashboard/admin/network", label: "خريطة الشبكة", icon: Share2 },
    ],
  },
  {
    label: "التسويق",
    tabs: [
      { href: "/dashboard/admin/signals", label: "التوصيات", icon: TrendingUp },
      { href: "/dashboard/admin/campaigns", label: "العروض", icon: Crosshair },
      { href: "/dashboard/admin/resources", label: "أدوات مجانية", icon: Download },
      { href: "/dashboard/admin/clicks", label: "رصد النقرات", icon: MousePointerClick },
    ],
  },
  {
    label: "المحتوى",
    tabs: [
      { href: "/dashboard/admin/posts", label: "المنشورات", icon: FileText },
      { href: "/dashboard/admin/content", label: "النصوص", icon: Type },
      { href: "/dashboard/admin/media", label: "الوسائط", icon: Images },
      { href: "/dashboard/admin/announcements", label: "الإعلانات", icon: Megaphone },
      { href: "/dashboard/admin/events", label: "التقويم", icon: CalendarDays },
    ],
  },
  {
    label: "المجتمع",
    tabs: [
      { href: "/dashboard/admin/forum", label: "المنتدى", icon: MessagesSquare },
    ],
  },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    /* Wrapping five labelled groups fills an entire phone screen before any
       admin content appears. Below `sm` it becomes one horizontal strip —
       the same pattern as the dashboard's own nav — and keeps the grouped
       layout from `sm` up, where there is room for it. */
    <div className="no-scrollbar -mx-1 flex gap-x-3 gap-y-4 overflow-x-auto border-b border-white/5 px-1 pb-4 sm:mx-0 sm:flex-wrap sm:gap-x-6 sm:overflow-visible sm:px-0">
      {groups.map((group) => (
        <div key={group.label} className="flex shrink-0 flex-col gap-1.5">
          <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            {group.label}
          </span>
          <div className="flex gap-1.5 sm:flex-wrap">
            {group.tabs.map((tab) => {
              const active = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[13px] font-medium transition sm:text-sm",
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
