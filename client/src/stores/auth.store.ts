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

// Zustand store for auth. `persist` keeps the session in localStorage so a
// refresh doesn't log you out. The axios interceptor reads `token` from here.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      // All three call the real backend, then stash user + token.
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
        // Clearing cart + wishlist on logout keeps accounts from mixing on a shared device.
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clear();
        set({ user: null, token: null });
      },
    }),
    {
      name: "lumen-auth",
      version: 1,
      // v0 stored the user with a legacy `_id` key; rename to `id`.
      migrate: (persisted: unknown) => {
        const state = persisted as { user: (Record<string, unknown> & { _id?: string }) | null; token: string | null };
        if (!state.user) return { user: null, token: state.token ?? null };
        const { _id, ...rest } = state.user;
        return { user: { ...rest, id: _id }, token: state.token ?? null };
      },
    }
  )
);