import api from "./client";
import type { ApiResponse } from "../types";

export interface DashboardCharts {
  revenueByDay: { date: string; label: string; total: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  lowStockItems: number;
}

// Chart data for the admin dashboard.
export async function getDashboardCharts() {
  const res = await api.get<ApiResponse<DashboardCharts>>("/dashboard/charts");
  return res.data.data;
}

// Aggregate store numbers for the (unauthenticated) admin login showcase.
export async function getPublicDashboardStats() {
  const res = await api.get<ApiResponse<DashboardStats>>("/dashboard/public-stats");
  return res.data.data;
}
