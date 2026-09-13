"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Sun, Moon, Laptop, Check } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "حسب الجهاز", icon: Laptop },
] as const;

/**
 * Light / Dark / System switcher.
 *
 * Built on the same dropdown pattern the header's "More" menu already uses —
 * outside-click and Escape to close — rather than pulling in a menu library
 * for one control on a site that is measured on mobile page weight.
 *
 * Until next-themes has read the stored preference on the client, `theme` is
 * undefined. Rendering a guessed icon in that window is what produces the
 * flicker everyone associates with theme toggles, so the trigger holds a
 * neutral placeholder of exactly the same size and swaps in the real icon
 * once mounted — no icon flip, no layout shift.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Icon = !mounted ? null : resolvedTheme === "light" ? Sun : Moon;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="تغيير مظهر الموقع"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-xl text-slate-400 transition hover:bg-fg/5 hover:text-fg sm:h-10 sm:w-10"
      >
        {Icon ? (
          <Icon className="h-[18px] w-[18px]" />
        ) : (
          <span className="h-[18px] w-[18px] rounded-full bg-fg/10" aria-hidden />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-fg/10 bg-ink-800 p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {OPTIONS.map((o) => {
            const active = mounted && theme === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-12 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:min-h-0",
                  active
                    ? "bg-brand-500/15 text-brand-200"
                    : "text-slate-300 hover:bg-fg/5 hover:text-fg"
                )}
              >
                <o.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-start">{o.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
