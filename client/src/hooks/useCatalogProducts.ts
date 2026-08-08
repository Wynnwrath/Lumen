import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product } from "../types";

// Loads the full product catalog once for the storefront (home, listing,
// header search, related products). Same fetch the pages used to repeat.
export function useCatalogProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
