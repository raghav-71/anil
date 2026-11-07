import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // EXACT SUNSET EDITORIAL LUXURY PALETTE
        cream: {
          DEFAULT: "#ffeedb", // Warm Cream
          50: "#fffaf5",
          100: "#fff4eb",
          200: "#ffeedb",
          300: "#ffd9be",
          400: "#ffb892",
        },
        brown: {
          DEFAULT: "#493129", // Deep Brown
          light: "#5e3f35",
          dark: "#35221b",
          900: "#221510",
        },
        mauve: {
          DEFAULT: "#8b597b", // Muted Mauve
          light: "#a26e92",
          dark: "#724463",
          50: "#faf4f8",
          100: "#f4e7f0",
        },
        coral: {
          DEFAULT: "#efa3a0", // Soft Coral
          hover: "#e58e8b",
          light: "#f9cbca",
          dark: "#d87572",
        },
        peach: {
          DEFAULT: "#ffdec7", // Light Peach
          light: "#fff1e8",
          dark: "#f2caa9",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(73, 49, 41, 0.04)",
        card: "0 8px 30px rgba(73, 49, 41, 0.06)",
        dropdown: "0 14px 40px rgba(73, 49, 41, 0.08)",
        coral: "0 6px 20px rgba(239, 163, 160, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
