export interface CustomerRecord {
  _id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
  address: string;
}

export interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  tier: string;
  totalOrders: number;
  totalSpent: number;
  address: string;
  registeredAt: string;
}
