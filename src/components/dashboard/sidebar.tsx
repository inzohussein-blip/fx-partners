"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useKBar } from "kbar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  LogOut,
  ShieldCheck,
  Users,
  Settings,
  Search,
  CalendarClock,
  FileSignature,
  Trophy,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "النظرة العامة", icon: LayoutDashboard, tour: "overview" },
  { href: "/dashboard/clients", label: "العملاء", icon: Users },
  { href: "/dashboard/markets", label: "الأسواق والأخبار", icon: CalendarClock },
  { href: "/dashboard/leaderboard", label: "لوحة المتصدّرين", icon: Trophy, tour: "leaderboard" },
  { href: "/dashboard/marketing", label: "أدوات التسويق", icon: Megaphone, tour: "marketing" },
  { href: "/dashboard/wallet", label: "المحفظة والسحوبات", icon: Wallet, tour: "wallet" },
  { href: "/dashboard/agreement", label: "اتفاقية الشراكة", icon: FileSignature },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

const adminLink = {
  href: "/dashboard/admin",
  label: "لوحة الإدارة",
  icon: ShieldCheck,
};

export function DashboardSidebar({
  email,
  isAdmin = false,
}: {
  email?: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const navLinks = isAdmin ? [...links, adminLink] : links;
  const { query } = useKBar();

  return (
    <aside className="flex w-full flex-col gap-1 border-b border-white/5 bg-ink-800/60 p-4 md:h-screen md:w-64 md:border-b-0 md:border-l">
      <Link href="/" className="mb-4 px-2">
        <Logo />
      </Link>

      <button
        type="button"
        data-tour="search"
        onClick={() => query.toggle()}
        className="mb-2 hidden items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2 text-sm text-slate-400 transition hover:text-white md:flex"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          بحث سريع
        </span>
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>

      <nav className="flex flex-row gap-1 md:flex-col">
        {navLinks.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              data-tour={"tour" in link ? link.tour : undefined}
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
