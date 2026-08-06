import api from "./client";

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

export async function getCustomers() {
  const res = await api.get<{ success: true; data: CustomerRecord[] }>("/customers");
  return res.data.data;
}
