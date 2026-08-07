export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Shipped"
  | "Completed"
  | "Received"
  | "Cancelled";

export interface OrderItem {
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
  status: OrderStatus;
  address: string;
  couponUsed?: string;
  orderNotes?: string;
  completedAt?: string;
  receivedAt?: string;
  createdAt: string;
}
