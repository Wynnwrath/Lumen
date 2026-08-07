import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "../types";

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

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
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode);
      },
    }
  )
);
