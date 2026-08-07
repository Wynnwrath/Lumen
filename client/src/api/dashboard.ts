import api from "./client";

export interface DashboardCharts {
  revenueByDay: { date: string; label: string; total: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export async function getDashboardCharts() {
  const res = await api.get<{ success: true; data: DashboardCharts }>("/dashboard/charts");
  return res.data.data;
}
