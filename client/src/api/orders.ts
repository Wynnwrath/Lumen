import api from "./client";
import type { ApiResponse, Order, OrderStatus, PaginationMeta } from "../types";

// Paginated orders response: data + pagination info.
export interface OrdersResponse extends PaginationMeta {
  orders: Order[];
}

// What the client sends when placing an order.
export interface CreateOrderPayload {
  // `product` is the product id (matches what the server validator expects).
  items: { product: string; quantity: number }[];
  address: string;
  paymentMethod: string;
  couponCode?: string;
  orderNotes?: string;
}

export interface OrderListParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export async function getOrders(params?: OrderListParams) {
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

// Orders for the logged-in customer ("My Orders" page).
export async function getMyOrders() {
  const res = await api.get<ApiResponse<Order[]>>("/orders/mine");
  return res.data.data;
}

// Customer confirms they received a Completed order for delivery settlement.
export async function confirmOrderReceived(orderNumber: string) {
  const res = await api.post<ApiResponse<Order>>(`/orders/${orderNumber}/confirm-received`);
  return res.data.data;
}

// Exports every order as a CSV download. The no-cache header stops the browser
// from serving a stale/blank previously-downloaded CSV.
export async function getOrdersCsv() {
  const res = await api.get("/orders/export", {
    responseType: "text",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return res.data;
}

// Downloads a raw CSV string as a file in the browser. Uses a UTF-8 BOM so
// Excel/spreadsheets render it correctly, appends the anchor to the DOM, and
// revokes the object URL after a tick so the download isn't aborted.
export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
