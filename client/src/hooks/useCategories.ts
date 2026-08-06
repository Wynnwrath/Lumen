import { useState } from "react";
import { dataService } from "../services/dataService";
import type { Category } from "../types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(dataService.getCategories());
  const refresh = () => setCategories(dataService.getCategories());
  return { categories, refresh };
}
