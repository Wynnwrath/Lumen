import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiResponse, AuthResult } from "../types";
import api from "../api/client";
import { useCartStore } from "./cart.store";
import { useWishlistStore } from "./wishlist.store";

interface AuthState {
  user: AuthResult["user"] | null;
  token: string | null;
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
      login: async (email, password) => {
        const res = await api.post<ApiResponse<AuthResult>>("/auth/login", { email, password });
        const { user, token } = res.data.data;
        set({ user, token });
      },
      loginAdmin: async (email, password) => {
        const res = await api.post<ApiResponse<AuthResult>>("/auth/admin/login", { email, password });
        const { user, token } = res.data.data;
        set({ user, token });
      },
      register: async (data) => {
        const res = await api.post<ApiResponse<AuthResult>>("/auth/register", data);
        const { user, token } = res.data.data;
        set({ user, token });
      },
      logout: () => {
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clear();
        set({ user: null, token: null });
      },
    }),
    {
      name: "lumen-auth",
      version: 1,
      partialize: (s) => ({ user: s.user, token: s.token }),
      migrate: (persisted) => {
        const state = persisted as { user?: { _id?: string } | null; token?: string | null };
        return { user: state.user ?? null, token: state.token ?? null };
      },
    }
  )
);

// derived selector — reactivity is guaranteed because it subscribes to `user`
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user);
