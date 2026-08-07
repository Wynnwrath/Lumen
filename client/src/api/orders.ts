import api from "./client";
import type { ApiResponse, Order, OrderStatus, PaginationMeta } from "../types";

export interface OrdersResponse extends PaginationMeta {
  orders: Order[];
}

export interface CreateOrderPayload {
  items: { product: string; quantity: number }[];
  address: string;
  paymentMethod: string;
  couponCode?: string;
  orderNotes?: string;
}

export async function getOrders(params?: { status?: OrderStatus; page?: number; limit?: number }) {
  const res = await api.get<ApiResponse<OrdersResponse>>("/orders", { params });
  return res.data.data;
}

export async function createOrder(data: CreateOrderPayload) {
  const res = await api.post<ApiResponse<Order>>("/orders", data);
  return res.data.data;
}

export async function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  const res = await api.patch<ApiResponse<Order>>(`/orders/${orderNumber}/status`, { status });
  return res.data.data;
}

export async function getMyOrders() {
  const res = await api.get<ApiResponse<Order[]>>("/orders/mine");
  return res.data.data;
}

export async function getOrdersCsv() {
  const res = await api.get("/orders/export", { responseType: "text" });
  return res.data;
}
