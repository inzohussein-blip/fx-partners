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
        // Brand identity — Electric Cyan (#00D1E6) primary accent
        brand: {
          50: "#e6fbfe",
          100: "#c0f4fb",
          200: "#8aeaf6",
          300: "#4dddef",
          400: "#00D1E6", // electric cyan — primary accent
          500: "#00b3c7", // primary cyan (surfaces/rings)
          600: "#0092a6",
          700: "#0e7686",
          800: "#155e6b",
          900: "#164e58",
          950: "#083038",
        },
        // Accent — Bright Blue (#008CFF): buttons, links, highlights
        accent: {
          300: "#5cb2ff",
          400: "#2a9cff",
          500: "#008CFF",
          600: "#0070d6",
          700: "#0057a8",
        },
        // Backgrounds — deep institutional navy (brand identity palette)
        ink: {
          900: "#0A0F14", // main page background (Deep Navy)
          800: "#111c27", // panels
          700: "#202F3C", // raised surfaces (Charcoal Navy)
          600: "#2b3f4f", // borders / hover
          500: "#0E3A5F", // ocean-blue accent surface
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
        "brand-gradient": "linear-gradient(90deg, #00D1E6 0%, #008CFF 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
