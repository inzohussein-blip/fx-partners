"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/**
 * Theme provider.
 *
 * `attribute="class"` is what pairs with Tailwind's `darkMode: "class"` and
 * with the `:root.light` token block in globals.css.
 *
 * `defaultTheme` is "system", which is what actually makes `enableSystem` do
 * anything: with a fixed default, next-themes uses that default whenever
 * nothing is stored, and the device preference is consulted only after the
 * visitor picks "System" by hand. Measured — a phone set to light was still
 * being served the dark theme on a first visit.
 *
 * So a visitor arriving on a light device sees the daytime interface, one on
 * a dark device sees the dark one, and either can override it. To open on the
 * dark brand identity regardless of the device instead, change this to
 * "dark"; nothing else needs to move.
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
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="fxp-theme"
    >
      {children}
    </NextThemes>
  );
}
