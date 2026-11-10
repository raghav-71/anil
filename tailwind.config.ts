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
        // OFFICIAL NEUTRAL ELEGANCE DESIGN SYSTEM PALETTE
        brand: {
          brown: "#493129",      // Deep Brown
          plum: "#8B597B",       // Plum
          rose: "#EFA3A0",       // Dusty Rose
          peach: "#FFDEC7",      // Peach
          cream: "#FFEDDB",      // Warm Cream
          card: "#FFFAF5",       // Product Card Background
          text: "#30241F",       // Primary Text
          textSecondary: "#806D63", // Secondary Text
          border: "#E8D5C5",     // Border
          input: "#FFFFFF",      // Input Background
          muted: "#F5E8DC",      // Muted Background
        },
        status: {
          success: "#27845A",
          warning: "#B7791F",
          error: "#C0393A",
          info: "#496C8B",
        },
        // Backward-compatible color aliases
        cream: {
          DEFAULT: "#FFEDDB",
          50: "#FFFAF5",
          100: "#F5E8DC",
          200: "#FFEDDB",
          300: "#FFDEC7",
          400: "#EFA3A0",
        },
        brown: {
          DEFAULT: "#493129",
          light: "#5e3f35",
          dark: "#30241F",
          900: "#221510",
        },
        mauve: {
          DEFAULT: "#8B597B",
          light: "#a26e92",
          dark: "#724463",
          50: "#faf4f8",
          100: "#f4e7f0",
        },
        coral: {
          DEFAULT: "#EFA3A0",
          hover: "#e58e8b",
          light: "#f9cbca",
          dark: "#d87572",
        },
        peach: {
          DEFAULT: "#FFDEC7",
          light: "#fff1e8",
          dark: "#E8D5C5",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(73, 49, 41, 0.04)",
        card: "0 8px 30px rgba(73, 49, 41, 0.06)",
        dropdown: "0 14px 40px rgba(73, 49, 41, 0.08)",
        coral: "0 4px 14px rgba(73, 49, 41, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
