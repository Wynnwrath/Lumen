import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

// Cart state, persisted to localStorage so it survives a refresh.
// Kept browser-side on purpose (per-browser, no account needed).
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        set((state) => {
          // If it's already in the cart, bump the quantity instead of adding a duplicate.
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: qty }] };
        });
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
      updateQuantity: (productId, qty) =>
        set((state) => ({
          items:
            // Quantity of 0 or less removes the line.
            qty <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "lumen-cart",
      version: 1,
      // v0 stored product objects with a legacy `_id` key; rename to `id`.
      migrate: (persisted: unknown) => {
        const state = persisted as { items: { product: Record<string, unknown>; quantity: number }[] };
        return {
          items: state.items.map((i) => {
            const { _id, ...rest } = i.product;
            return { product: { ...rest, id: _id }, quantity: i.quantity };
          }),
        };
      },
    }
  )
);
