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
        // Brand identity — Gold (#C9A227) primary accent on royal navy (luxury)
        brand: {
          50: "#fbf7ea",
          100: "#f6edce",
          200: "#eedca0",
          300: "#E6C15A", // light gold — text / icons on navy
          400: "#D8B441", // gold — links / active / CTA text
          500: "#C9A227", // gold — surfaces / rings
          600: "#a9861d",
          700: "#866818",
          800: "#6a5216",
          900: "#574515",
          950: "#302607",
        },
        // Accent — warmer champagne gold for gradients / highlights / hover
        accent: {
          300: "#eedca0",
          400: "#E6C15A",
          500: "#C9A227",
          600: "#a9861d",
          700: "#866818",
        },
        // Backgrounds — deep royal navy (luxury palette)
        ink: {
          900: "#0B1220", // main page background (Royal Navy)
          800: "#111A2E", // panels
          700: "#1B2743", // raised surfaces
          600: "#2B3A5A", // borders / hover
          500: "#13203F", // deep royal accent surface
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
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px -10px rgba(201, 162, 39, 0.45)",
        "glow-blue": "0 10px 40px -10px rgba(230, 193, 90, 0.45)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        // Primary brand gradient — Champagne → Gold
        "brand-gradient": "linear-gradient(90deg, #E6C15A 0%, #C9A227 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
