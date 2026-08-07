import { useFetch } from "./useFetch";
import { getCustomers } from "../api/customers";
import type { CustomerData } from "../types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function deriveTier(totalSpent: number): string {
  if (totalSpent >= 2000) return "VIP Customer";
  if (totalSpent >= 500) return "Pro Member";
  return "Standard Member";
}

function avatarFor(name: string): string {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#dbeafe"/>` +
    `<text x="48" y="58" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#2563eb" text-anchor="middle">${initials}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const toCustomerData = (r: { _id: string; name: string; email: string; phone: string; registeredAt: string; totalOrders: number; totalSpent: number; address: string }): CustomerData => ({
  _id: r._id,
  name: r.name,
  email: r.email,
  phone: r.phone || "",
  avatar: avatarFor(r.name),
  tier: deriveTier(r.totalSpent),
  totalOrders: r.totalOrders,
  totalSpent: r.totalSpent,
  address: r.address || "",
  registeredAt: formatDate(r.registeredAt),
});

export function useCustomers() {
  const { data, refresh, loading } = useFetch(
    () => getCustomers().then((records) => records.map(toCustomerData))
  );
  return { customers: data ?? [], refresh, loading };
}
