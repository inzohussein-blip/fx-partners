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
        // Brand identity — cyan primary (from the "partners" logo gradient)
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee", // bright cyan (logo highlight)
          500: "#06b6d4", // primary cyan
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // Accent — royal blue (the deep side of the logo gradient)
        accent: {
          300: "#60a5fa",
          400: "#3b82f6",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        // Backgrounds — deep navy, matching the brand mockups
        ink: {
          900: "#060f1e", // page background
          800: "#0a1728", // panels
          700: "#0f2136", // raised surfaces
          600: "#183149", // borders / hover
          500: "#26425f",
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
        glow: "0 10px 40px -10px rgba(34, 211, 238, 0.45)",
        "glow-blue": "0 10px 40px -10px rgba(37, 99, 235, 0.5)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(90deg, #2563eb 0%, #22d3ee 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
