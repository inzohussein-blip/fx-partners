import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Arabic (default) has no prefix; English is served under /en.
  localePrefix: "as-needed",
  // Arabic is the primary language: never auto-redirect based on the
  // browser's Accept-Language. English is opt-in via the switcher (/en).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
