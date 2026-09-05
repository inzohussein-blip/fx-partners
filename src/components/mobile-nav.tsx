"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowLeft } from "lucide-react";

type Item = { href: string; label: string };

export function MobileNav({
  items,
  loginLabel,
  dashboardLabel,
}: {
  items: Item[];
  loginLabel: string;
  dashboardLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal target is only available on the client.
  useEffect(() => setMounted(true), []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="القائمة"
        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Rendered through a portal to <body>: the sticky header uses
          backdrop-blur, which makes it the containing block for fixed
          descendants — so a drawer rendered inline would be trapped inside the
          64px-tall header instead of covering the viewport. */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
            style={{ backgroundColor: "#0b1118" }}
            className="absolute inset-y-0 start-0 flex w-72 max-w-[85%] flex-col overflow-y-auto border-e border-white/10 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">القائمة</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-brand-500/15 text-brand-200"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 border-t border-white/5 pt-4">
              <Link
                href="/login"
                className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-white/5"
              >
                {loginLabel}
              </Link>
              <Link
                href="/login"
                className="btn-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {dashboardLabel}
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
