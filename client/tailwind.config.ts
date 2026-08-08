import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ─── Primary ───────────────────────────────────────────
        primary: "#0f172a",
        "on-primary": "#ffffff",
        "primary-container": "#131b2e",

        // ─── Secondary ─────────────────────────────────────────
        secondary: "#0051d5",
        "on-secondary": "#ffffff",
        "secondary-container": "#316bf3",
        "on-secondary-container": "#fefcff",
        "secondary-fixed": "#dbe1ff",

        // ─── Surfaces ──────────────────────────────────────────
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45464d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",

        // ─── Outline ───────────────────────────────────────────
        outline: "#76777d",
        "outline-variant": "#c6c6cd",

        // ─── Error ─────────────────────────────────────────────
        error: "#ba1a1a",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
