export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
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
