import { useFetch } from "./useFetch";
import { getCategories } from "../api/categories";

export function useCategories() {
  const { data, refresh, loading } = useFetch(getCategories);
  return { categories: data ?? [], refresh, loading };
}
