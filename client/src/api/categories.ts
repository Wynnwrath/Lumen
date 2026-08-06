import api from "./client";
import type { Category } from "../types";

export async function getCategories() {
  const res = await api.get<{ success: true; data: Category[] }>("/categories");
  return res.data.data;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export async function createCategory(data: CategoryPayload) {
  const res = await api.post<{ success: true; data: Category }>("/categories", data);
  return res.data.data;
}

export async function updateCategory(slug: string, data: CategoryPayload) {
  const res = await api.patch<{ success: true; data: Category }>(`/categories/${slug}`, data);
  return res.data.data;
}

export async function deleteCategory(slug: string) {
  await api.delete<{ success: true; data: null }>(`/categories/${slug}`);
}
