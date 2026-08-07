import api from "./client";
import type { ApiResponse, PaginationMeta, Product } from "../types";

export interface ProductsResponse extends PaginationMeta {
  products: Product[];
}

export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  images: string[];
  description?: string;
}

export async function getProducts(params?: Record<string, string | number | boolean>) {
  const res = await api.get<ApiResponse<ProductsResponse>>("/products", { params });
  return res.data.data;
}

export async function getAdminProducts() {
  const res = await api.get<ApiResponse<ProductsResponse>>("/products/manage");
  return res.data.data;
}

export async function getProduct(id: string) {
  const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(data: ProductPayload) {
  const res = await api.post<ApiResponse<Product>>("/products", data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<ProductPayload>) {
  const res = await api.patch<ApiResponse<Product>>(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string) {
  await api.delete<ApiResponse<null>>(`/products/${id}`);
}
