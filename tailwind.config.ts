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
        // FinTech palette — trust, security, depth
        brand: {
          50: "#e6f7f4",
          100: "#c0ebe4",
          200: "#86d8cc",
          300: "#43c1af",
          400: "#16a894",
          500: "#0d8b7c", // primary accent (emerald/teal — money, growth)
          600: "#0a6f65",
          700: "#0b5952",
          800: "#0c4741",
          900: "#0b3a36",
          950: "#032420",
        },
        ink: {
          900: "#0a0e14", // near-black background
          800: "#0f1520",
          700: "#161d2b",
          600: "#1f2937",
          500: "#334155",
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
        glow: "0 0 40px -10px rgba(13, 139, 124, 0.45)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
