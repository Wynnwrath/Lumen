import api from "./client";
import type { ApiResponse, CustomerRecord } from "../types";

export async function getCustomers() {
  const res = await api.get<ApiResponse<CustomerRecord[]>>("/customers");
  return res.data.data;
}
