import { useState } from "react";
import { dataService } from "../services/dataService";
import type { Product } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(dataService.getProducts());
  const refresh = () => setProducts(dataService.getProducts());
  return { products, refresh };
}
