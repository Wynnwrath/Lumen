export interface CustomerApiRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
  address: string;
}

export interface CustomerListItem {
  id: string;
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
