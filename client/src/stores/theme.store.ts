import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "../types";

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
}

// Adds/removes the `dark` class on <html>; Tailwind's darkMode: "class" uses it.
function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Light/dark mode, persisted so the choice sticks across reloads.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      toggle: () => {
        const next = get().mode === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ mode: next });
      },
    }),
    {
      name: "lumen-theme",
      // Re-apply the saved theme on reload (before the app paints).
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode);
      },
    }
  )
);
