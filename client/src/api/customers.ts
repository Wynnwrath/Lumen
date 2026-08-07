import api from "./client";
import type { ApiResponse, CustomerRecord } from "../types";

// Customer directory for the admin panel.
export async function getCustomers() {
  const res = await api.get<ApiResponse<CustomerRecord[]>>("/customers");
  return res.data.data;
}
