export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: "active" | "out_of_stock" | "inactive";
  rating: number;
  reviewsCount: number;
  arrival: boolean;
  isSale: boolean;
  images: string[];
  description: string;
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

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
  address: string;
  couponUsed?: string;
  orderNotes?: string;
  createdAt: string;
}

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ---- Customer (shown in the admin customer directory) ----
export interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: string;
  totalOrders: number;
  totalSpent: number;
  address: string;
  registeredAt: string;
}

// ---- Small UI helpers shared across a few pages ----
export interface ToastMessage {
  message: string;
  type: "info" | "success" | "error" | "cart" | "wishlist";
}

export type ThemeMode = "light" | "dark";
