import { useFetch } from "./useFetch";
import { getOrders } from "../api/orders";

export function useOrders() {
  const { data, refresh, loading } = useFetch(() => getOrders({ limit: 100 }).then((r) => r.orders));
  return { orders: data ?? [], refresh, loading };
}
