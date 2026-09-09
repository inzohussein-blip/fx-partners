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
        // Brand identity — Primary Cyan (#00D1DF) per Partners FX brand brief
        brand: {
          50: "#e6fbfc",
          100: "#c0f4f7",
          200: "#88e9ee",
          300: "#4dddE4",
          400: "#00D1DF", // primary cyan — CTAs, active icons, links
          500: "#00b6c4", // primary cyan (surfaces/rings)
          600: "#0295a2",
          700: "#0c7681",
          800: "#135e67",
          900: "#154e56",
          950: "#083035",
        },
        // Secondary — Teal (#0EC6C7): gradients, highlights, hover (brand brief)
        accent: {
          300: "#5fd8d9",
          400: "#18c3c4",
          500: "#0EC6C7",
          600: "#0aa1a2",
          700: "#0b7f80",
        },
        // Backgrounds — Deep Teal / Charcoal (brand brief), kept dark & premium
        ink: {
          900: "#0A1417", // main page background (deep teal-charcoal)
          800: "#12222a", // panels
          700: "#2E3F46", // raised surfaces (brief: Deep Background)
          600: "#405961", // borders / hover (brief: Elements)
          500: "#123A40", // teal accent surface
        },
        // Premium metallic typography / logo
        silver: {
          DEFAULT: "#C0CACC",
          light: "#F5F7FA",
        },
        gold: {
          400: "#f5c451",
          500: "#e0a92e",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "var(--font-cairo)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(0, 209, 230, 0.45)",
        "glow-blue": "0 10px 40px -10px rgba(0, 140, 255, 0.5)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        // Primary brand gradient — Electric Cyan → Bright Blue
        "brand-gradient": "linear-gradient(90deg, #00D1DF 0%, #0EC6C7 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
