import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  prune: (validIds: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      prune: (validIds) =>
        set((state) => {
          const valid = new Set(validIds);
          const pruned = state.ids.filter((id) => valid.has(id));
          return pruned.length === state.ids.length ? state : { ids: pruned };
        }),
    }),
    { name: "lumen-wishlist" }
  )
);
