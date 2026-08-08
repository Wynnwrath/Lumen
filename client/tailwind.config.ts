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
        "on-primary-container": "#7c839b",

        // ─── Secondary ─────────────────────────────────────────
        secondary: "#0051d5",
        "on-secondary": "#ffffff",
        "secondary-container": "#316bf3",
        "on-secondary-container": "#fefcff",
        "secondary-fixed": "#dbe1ff",
        "secondary-fixed-dim": "#b4c5ff",

        // ─── Tertiary ──────────────────────────────────────────
        tertiary: "#000000",
        "tertiary-container": "#191c1e",

        // ─── Surfaces ──────────────────────────────────────────
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45464d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",

        // ─── Outline ───────────────────────────────────────────
        outline: "#76777d",
        "outline-variant": "#c6c6cd",

        // ─── Error ─────────────────────────────────────────────
        error: "#ba1a1a",
        "error-container": "#ffdad6",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
