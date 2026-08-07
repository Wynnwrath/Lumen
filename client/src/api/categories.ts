import api from "./client";
import type { ApiResponse, Category } from "../types";

export async function getCategories() {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export async function createCategory(data: CategoryPayload) {
  const res = await api.post<ApiResponse<Category>>("/categories", data);
  return res.data.data;
}

export async function updateCategory(slug: string, data: CategoryPayload) {
  const res = await api.patch<ApiResponse<Category>>(`/categories/${slug}`, data);
  return res.data.data;
}

export async function deleteCategory(slug: string) {
  await api.delete<ApiResponse<null>>(`/categories/${slug}`);
}
