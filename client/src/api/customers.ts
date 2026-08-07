import api from "./client";
import type { ApiResponse, CustomerApiRecord } from "../types";

// Customer directory for the admin panel.
export async function getCustomers() {
  const res = await api.get<ApiResponse<CustomerApiRecord[]>>("/customers");
  return res.data.data;
}
