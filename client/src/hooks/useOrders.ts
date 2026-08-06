import { useState } from "react";
import { dataService } from "../services/dataService";
import type { Order } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const refresh = () => setOrders(dataService.getOrders());
  return { orders, refresh };
}
