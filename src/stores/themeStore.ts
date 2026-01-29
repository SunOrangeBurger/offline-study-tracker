import { create } from "zustand";
import { Theme } from "../types";
import { api } from "../api/client";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",
  setTheme: async (theme: Theme) => {
    try {
      await api.theme.set(theme);
      set({ theme });
    } catch (error) {
      console.error("Failed to save theme:", error);
      // Still update the UI even if backend fails
      set({ theme });
    }
  },
  toggleTheme: async () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    await get().setTheme(newTheme);
  },
}));
