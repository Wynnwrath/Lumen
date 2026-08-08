import React, { useCallback } from "react";
import { useCartStore } from "../stores/cart.store";
import { useToast } from "../components/ui/ToastProvider";
import type { Product } from "../types";

// Shared "add to cart" handler used by product cards across pages.
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  return useCallback(
    (product: Product, e?: React.MouseEvent) => {
      // Don't let the click also navigate/trigger the card's own click.
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (product.stock <= 0) return;
      addItem(product, 1);
      showToast(`Added "${product.name}" to cart!`, "success");
    },
    [addItem, showToast]
  );
}
