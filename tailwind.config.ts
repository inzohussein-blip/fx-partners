import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Theme-aware palette.
         *
         * Roughly 1,600 colour utilities were already written across 147 files
         * for a dark-only site. Rather than rewrite every one of them, the
         * colour *names* they already use are backed by CSS variables that
         * flip in globals.css — so `bg-ink-900`, `text-slate-400` and the rest
         * keep their meaning (page surface, muted text) and simply resolve to
         * the right value for the active theme.
         *
         * The `rgb(... / <alpha-value>)` form is what preserves the opacity
         * modifiers the codebase leans on heavily (`bg-fg/5`, `border-fg/10`).
         */

        /** Foreground ink: white on dark, near-black navy on light. */
        fg: "rgb(var(--c-fg) / <alpha-value>)",

        /**
         * Brand identity — electric blue / cyan, sampled from the approved
         * Partners FX visual. Steps 100–400 are the ones used as *text*
         * (`text-brand-300` alone appears 162 times); on a white background
         * the dark-mode cyan reads at about 1.5:1, so light mode deepens them
         * while 500+ keep their value as fills and tints.
         */
        brand: {
          50: "rgb(var(--c-brand-50) / <alpha-value>)",
          100: "rgb(var(--c-brand-100) / <alpha-value>)",
          200: "rgb(var(--c-brand-200) / <alpha-value>)",
          300: "rgb(var(--c-brand-300) / <alpha-value>)",
          400: "rgb(var(--c-brand-400) / <alpha-value>)",
          500: "rgb(var(--c-brand-500) / <alpha-value>)",
          600: "rgb(var(--c-brand-600) / <alpha-value>)",
          700: "#0060cc",
          800: "#004884",
          900: "#003C78",
          950: "#002448",
        },
        // Accent — deeper blue for gradients / highlights / hover
        accent: {
          300: "rgb(var(--c-accent-300) / <alpha-value>)",
          400: "rgb(var(--c-accent-400) / <alpha-value>)",
          500: "#0078FC",
          600: "#0060cc",
          700: "#004884",
        },
        /** Surfaces: near-black navy on dark, snow on light. */
        ink: {
          900: "rgb(var(--c-ink-900) / <alpha-value>)", // main page background
          800: "rgb(var(--c-ink-800) / <alpha-value>)", // panels
          700: "rgb(var(--c-ink-700) / <alpha-value>)", // raised surfaces
          600: "rgb(var(--c-ink-600) / <alpha-value>)", // borders / hover
          500: "rgb(var(--c-ink-500) / <alpha-value>)", // deep blue accent surface
        },
        /**
         * Muted text scale, overriding Tailwind's slate for the steps this
         * codebase uses. The roles stay fixed — 300 is prominent secondary
         * text, 600 is the dimmest label — and light mode inverts the ramp
         * around 500 so those roles survive the flip.
         */
        slate: {
          100: "rgb(var(--c-slate-100) / <alpha-value>)",
          200: "rgb(var(--c-slate-200) / <alpha-value>)",
          300: "rgb(var(--c-slate-300) / <alpha-value>)",
          400: "rgb(var(--c-slate-400) / <alpha-value>)",
          500: "rgb(var(--c-slate-500) / <alpha-value>)",
          600: "rgb(var(--c-slate-600) / <alpha-value>)",
          700: "rgb(var(--c-slate-700) / <alpha-value>)",
        },
        /**
         * Status colours. The 300/400 steps were picked to glow on near-black;
         * on a pale ground the same values sit at 1.1–1.6:1, which is not a
         * "muted" look — it is unreadable. Light mode moves them down the ramp
         * so gains stay green, losses stay red, and both stay legible.
         */
        emerald: {
          300: "rgb(var(--c-emerald-300) / <alpha-value>)",
          400: "rgb(var(--c-emerald-400) / <alpha-value>)",
        },
        red: {
          300: "rgb(var(--c-red-300) / <alpha-value>)",
          400: "rgb(var(--c-red-400) / <alpha-value>)",
        },
        rose: {
          300: "rgb(var(--c-rose-300) / <alpha-value>)",
          400: "rgb(var(--c-rose-400) / <alpha-value>)",
        },
        amber: {
          300: "rgb(var(--c-amber-300) / <alpha-value>)",
          400: "rgb(var(--c-amber-400) / <alpha-value>)",
        },
        orange: {
          300: "rgb(var(--c-orange-300) / <alpha-value>)",
        },
        blue: {
          300: "rgb(var(--c-blue-300) / <alpha-value>)",
        },
        // Premium metallic typography / logo
        // Theme-aware: the dark theme's #C0CACC on the light theme's
        // near-white page left "PARTNERS" in the logo barely legible.
        silver: {
          DEFAULT: "rgb(var(--c-silver) / <alpha-value>)",
          light: "#F5F7FA",
        },
        gold: {
          400: "#f5c451",
          500: "#e0a92e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 16px 40px -14px var(--c-glow)",
        "glow-blue": "0 16px 40px -14px var(--c-glow-cyan)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(var(--c-fg) / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--c-fg) / 0.03) 1px, transparent 1px)",
        // Primary brand gradient — Cyan → Electric Blue
        "brand-gradient": "linear-gradient(90deg, #54D8F0 0%, #0090FC 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
