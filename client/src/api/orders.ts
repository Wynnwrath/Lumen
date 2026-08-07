import api from "./client";
import { useAuthStore } from "../stores/auth.store";
import type { Order } from "../types";

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getOrders(params?: { status?: string; page?: number; limit?: number }) {
  const res = await api.get<{ success: true; data: OrdersResponse }>("/orders", { params });
  return res.data.data;
}

export interface CreateOrderPayload {
  items: { product: string; quantity: number }[];
  address: string;
  paymentMethod: string;
  couponCode?: string;
  orderNotes?: string;
}

export async function createOrder(data: CreateOrderPayload) {
  const res = await api.post<{ success: true; data: Order }>("/orders", data);
  return res.data.data;
}

export async function updateOrderStatus(orderNumber: string, status: string) {
  const res = await api.patch<{ success: true; data: Order }>(`/orders/${orderNumber}/status`, { status });
  return res.data.data;
}

export async function getMyOrders() {
  const res = await api.get<{ success: true; data: Order[] }>("/orders/mine");
  return res.data.data;
}

export async function getOrdersCsv() {
  const token = useAuthStore.getState().token;
  const res = await fetch("/api/orders/export", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Export failed");
  return res.text();
}
