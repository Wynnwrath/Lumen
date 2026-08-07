import React, { useCallback } from "react";
import { useCartStore } from "../stores/cart.store";
import { useToast } from "../components/common/ToastProvider";
import type { Product } from "../types";

export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const { showToast } = useToast();

  return useCallback(
    (product: Product, e?: React.MouseEvent) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (product.stock <= 0) return;
      addItem(product, 1);
      showToast(`Added "${product.name}" to cart!`, "success");
    },
    [addItem, showToast]
  );
}
