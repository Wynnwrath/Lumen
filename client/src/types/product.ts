export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: "active" | "out_of_stock" | "inactive";
  rating: number;
  reviewsCount: number;
  arrival: boolean;
  isSale: boolean;
  images: string[];
  description?: string;
  specs: Record<string, string>;
  isNew?: boolean;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}
