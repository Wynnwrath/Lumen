import api from "./client";
import type { ApiResponse, PaginationMeta, Product, ProductStatus } from "../types";

// Paginated products response: data + pagination info.
export interface ProductsResponse extends PaginationMeta {
  products: Product[];
}

// What the client sends when creating/updating a product.
export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: ProductStatus;
  isSale?: boolean;
  arrival?: boolean;
  images: string[];
  description?: string;
}

// Every function unwraps res.data.data so callers get the payload directly.
export async function getProducts(params?: Record<string, string | number | boolean>) {
  const res = await api.get<ApiResponse<ProductsResponse>>("/products", { params });
  return res.data.data;
}

// Admin endpoint that returns everything (including inactive).
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
