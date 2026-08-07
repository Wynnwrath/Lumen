import api from "./client";
import type { ApiResponse } from "../types";

export interface DashboardCharts {
  revenueByDay: { date: string; label: string; total: number }[];
  ordersByStatus: { status: string; count: number }[];
}

// Chart data for the admin dashboard.
export async function getDashboardCharts() {
  const res = await api.get<ApiResponse<DashboardCharts>>("/dashboard/charts");
  return res.data.data;
}
