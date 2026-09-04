"use client";

import { useMemo } from "react";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  type Action,
} from "kbar";
import { useRouter } from "@/i18n/navigation";

export function CommandPalette({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const actions: Action[] = useMemo(() => {
    const nav = "التنقّل";
    const base: Action[] = [
      { id: "overview", name: "النظرة العامة", keywords: "overview home رئيسية", section: nav, perform: () => router.push("/dashboard") },
      { id: "clients", name: "العملاء", keywords: "clients referrals عملاء إحالات", section: nav, perform: () => router.push("/dashboard/clients") },
      { id: "markets", name: "الأسواق والأخبار", keywords: "markets news calendar تقويم أخبار", section: nav, perform: () => router.push("/dashboard/markets") },
      { id: "marketing", name: "أدوات التسويق", keywords: "marketing referral links روابط", section: nav, perform: () => router.push("/dashboard/marketing") },
      { id: "wallet", name: "المحفظة والسحوبات", keywords: "wallet withdraw سحب رصيد", section: nav, perform: () => router.push("/dashboard/wallet") },
      { id: "settings", name: "الإعدادات", keywords: "settings profile ملف", section: nav, perform: () => router.push("/dashboard/settings") },
    ];

    const admin: Action[] = isAdmin
      ? [
          { id: "admin", name: "الإدارة — الاعتمادات", keywords: "admin approvals وكلاء سحوبات", section: "الإدارة", perform: () => router.push("/dashboard/admin") },
          { id: "admin-posts", name: "الإدارة — المنشورات", keywords: "posts blog منشورات", section: "الإدارة", perform: () => router.push("/dashboard/admin/posts") },
          { id: "admin-content", name: "الإدارة — النصوص", keywords: "content نصوص", section: "الإدارة", perform: () => router.push("/dashboard/admin/content") },
          { id: "admin-partners", name: "الإدارة — الشركاء", keywords: "partners شركاء", section: "الإدارة", perform: () => router.push("/dashboard/admin/partners") },
        ]
      : [];

    const general: Action[] = [
      { id: "site", name: "الموقع الرئيسي", keywords: "site landing", section: "عام", perform: () => router.push("/") },
      {
        id: "signout",
        name: "تسجيل الخروج",
        keywords: "logout sign out خروج",
        section: "عام",
        perform: async () => {
          await fetch("/auth/sign-out", { method: "POST" });
          router.push("/login");
          router.refresh();
        },
      },
    ];

    return [...base, ...admin, ...general];
  }, [router, isAdmin]);

  return (
    <KBarProvider actions={actions}>
      <CommandBar />
      {children}
    </KBarProvider>
  );
}

function CommandBar() {
  return (
    <KBarPortal>
      <KBarPositioner className="z-[100] bg-black/60 p-4 backdrop-blur-sm">
        <KBarAnimator className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl">
          <KBarSearch
            className="w-full border-b border-white/5 bg-transparent px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none"
            defaultPlaceholder="ابحث أو انتقل… (⌘K)"
          />
          <Results />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
}

function Results() {
  const { results } = useMatches();
  return (
    <div className="max-h-80 overflow-y-auto py-2">
      <KBarResults
        items={results}
        onRender={({ item, active }) =>
          typeof item === "string" ? (
            <div className="px-5 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {item}
            </div>
          ) : (
            <div
              className={`mx-2 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                active ? "bg-brand-500/15 text-white" : "text-slate-300"
              }`}
            >
              <span>{item.name}</span>
            </div>
          )
        }
      />
    </div>
  );
}
