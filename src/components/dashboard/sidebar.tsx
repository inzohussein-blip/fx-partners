"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Megaphone, Wallet, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "النظرة العامة", icon: LayoutDashboard },
  { href: "/dashboard/marketing", label: "أدوات التسويق", icon: Megaphone },
  { href: "/dashboard/wallet", label: "المحفظة والسحوبات", icon: Wallet },
];

export function DashboardSidebar({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-1 border-b border-white/5 bg-ink-800/60 p-4 md:h-screen md:w-64 md:border-b-0 md:border-l">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold text-white">
          FX
        </span>
        <span className="font-bold text-white">Partners</span>
      </Link>

      <nav className="flex flex-row gap-1 md:flex-col">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:flex-none",
                active
                  ? "bg-brand-500/15 text-brand-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-white/5 pt-4 md:block">
        {email && (
          <p className="truncate px-2 pb-2 text-xs text-slate-500">{email}</p>
        )}
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
