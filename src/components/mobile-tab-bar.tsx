"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Home, Scale, Gift, MessagesSquare, UserRound } from "lucide-react";

/**
 * Phone navigation.
 *
 * The desktop header collapses to a hamburger below `md`, which means every
 * move on a phone costs two taps and hides where you are. Most of this site's
 * traffic is phones, so they get a persistent tab bar instead — the thumb-zone
 * pattern people already know from apps, with the current section always
 * visible.
 *
 * It is a genuinely separate navigation, not the desktop menu restyled: five
 * destinations chosen for what a phone visitor actually does (compare, check
 * offers, read the forum, reach their account), while the full site map stays
 * one tap away in the header drawer.
 */
type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  /** Home matches only itself; every other tab also owns its sub-routes. */
  exact?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "الرئيسية", icon: Home, exact: true },
  { href: "/compare", label: "قارن", icon: Scale },
  { href: "/offers", label: "العروض", icon: Gift },
  { href: "/forum", label: "المنتدى", icon: MessagesSquare },
  { href: "/dashboard", label: "حسابي", icon: UserRound },
];

export function MobileTabBar() {
  const pathname = usePathname();

  // next-intl keeps the locale in the path (/en/compare); strip it so the
  // active state matches on both locales.
  const path = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";

  return (
    <>
      {/* Reserves the bar's height in normal flow so the last section of the
          page is never trapped underneath a fixed element. */}
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden />

      <nav
        aria-label="التنقّل السريع"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 md:hidden",
          "border-t border-white/10 bg-ink-900/95 backdrop-blur-xl",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const active = tab.exact
              ? path === "/"
              : path === tab.href || path.startsWith(`${tab.href}/`);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    // 64px tall: comfortably above the 44px minimum touch
                    // target, with the label and icon both inside it.
                    "flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition",
                    active ? "text-brand-300" : "text-slate-500 active:text-slate-300"
                  )}
                >
                  <span className="relative grid h-6 w-6 place-items-center">
                    <tab.icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={active ? 2.4 : 1.9}
                    />
                    {active && (
                      <span
                        className="absolute -top-2 h-1 w-1 rounded-full bg-brand-300"
                        aria-hidden
                      />
                    )}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
