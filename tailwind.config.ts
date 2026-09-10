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
        // Brand identity — electric blue / cyan, sampled from the approved
        // Partners FX visual (headline #54D8F0 → #0090FC, CTA #00B4FC → #0078FC)
        brand: {
          50: "#e8f7ff",
          100: "#c9ecff",
          200: "#9adcff",
          300: "#54D8F0", // cyan highlight — headline accent, icons, links
          400: "#22B8FC", // bright blue
          500: "#0090FC", // primary blue — surfaces / rings
          600: "#0078FC", // CTA blue
          700: "#0060cc",
          800: "#004884",
          900: "#003C78",
          950: "#002448",
        },
        // Accent — deeper blue for gradients / highlights / hover
        accent: {
          300: "#6EC6FF",
          400: "#22A8FC",
          500: "#0078FC",
          600: "#0060cc",
          700: "#004884",
        },
        // Backgrounds — near-black navy (sampled from the reference)
        ink: {
          900: "#01070F", // main page background
          800: "#08192B", // panels
          700: "#0A2036", // raised surfaces
          600: "#16324D", // borders / hover
          500: "#002448", // deep blue accent surface
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
        glow: "0 16px 40px -14px rgba(0, 144, 252, 0.85)",
        "glow-blue": "0 16px 40px -14px rgba(84, 216, 240, 0.6)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        // Primary brand gradient — Cyan → Electric Blue
        "brand-gradient": "linear-gradient(90deg, #54D8F0 0%, #0090FC 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
