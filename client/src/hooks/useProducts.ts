import { useFetch } from "./useFetch";
import { getAdminProducts } from "../api/products";

export function useProducts() {
  const { data, refresh, loading } = useFetch(() => getAdminProducts().then((r) => r.products));
  return { products: data ?? [], refresh, loading };
}
