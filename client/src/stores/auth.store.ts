import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthResult } from "../types";
import api from "../api/client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await api.post<{ success: true; data: AuthResult }>("/auth/login", { email, password });
        const { user, token } = res.data.data;
        set({ user, token, isAuthenticated: true });
      },
      loginAdmin: async (email, password) => {
        const res = await api.post<{ success: true; data: AuthResult }>("/auth/admin/login", { email, password });
        const { user, token } = res.data.data;
        set({ user, token, isAuthenticated: true });
      },
      register: async (data) => {
        const res = await api.post<{ success: true; data: AuthResult }>("/auth/register", data);
        const { user, token } = res.data.data;
        set({ user, token, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "lumen-auth" }
  )
);
