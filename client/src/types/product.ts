export type ProductStatus = "active" | "out_of_stock" | "inactive";

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  reviewsCount: number;
  arrival: boolean;
  isSale: boolean;
  images: string[];
  description?: string;
  specs: Record<string, string>;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}
