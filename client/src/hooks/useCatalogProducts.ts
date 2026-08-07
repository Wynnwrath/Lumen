import { useFetch } from "./useFetch";
import { getProducts } from "../api/products";

export function useCatalogProducts() {
  const { data, refresh, loading } = useFetch(() =>
    getProducts({ limit: 100 }).then((r) => r.products)
  );
  return { products: data ?? [], refresh, loading };
}
