"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * Theme provider.
 *
 * `attribute="class"` is what pairs with Tailwind's `darkMode: "class"` and
 * with the `:root.light` token block in globals.css.
 *
 * The default is dark: this is a dark-first financial interface, and someone
 * arriving with no preference should see the identity the brand was designed
 * around. `enableSystem` still means a visitor whose device asks for light
 * gets light on their first visit, without having to find the switch.
 *
 * `disableTransitionOnChange` suppresses every CSS transition for the instant
 * the class flips. Without it, hundreds of elements carrying `transition`
 * animate their colours at once and the switch reads as a slow smear rather
 * than an instant change.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="fxp-theme"
    >
      {children}
    </NextThemes>
  );
}
