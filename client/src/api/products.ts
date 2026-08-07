import api from "./client";
import type { Product } from "../types";

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  images: string[];
  description: string;
}

export async function getProducts(params?: Record<string, string | number | boolean>) {
  const res = await api.get<{ success: true; data: ProductsResponse }>("/products", { params });
  return res.data.data;
}

export async function getAdminProducts() {
  const res = await api.get<{ success: true; data: ProductsResponse }>("/products/manage");
  return res.data.data;
}

export async function getProduct(id: string) {
  const res = await api.get<{ success: true; data: Product }>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(data: ProductPayload) {
  const res = await api.post<{ success: true; data: Product }>("/products", data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<ProductPayload>) {
  const res = await api.patch<{ success: true; data: Product }>(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string) {
  await api.delete<{ success: true; data: null }>(`/products/${id}`);
}
