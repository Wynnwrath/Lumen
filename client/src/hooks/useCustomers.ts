import { useCallback, useEffect, useState } from "react";
import { getCustomers } from "../api/customers";
import { formatDate } from "../utils/format";
import type { CustomerListItem } from "../types";

function deriveTier(totalSpent: number): string {
  if (totalSpent >= 2000) return "VIP Customer";
  if (totalSpent >= 500) return "Pro Member";
  return "Standard Member";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const toCustomerListItem = (r: { id: string; name: string; email: string; phone: string; registeredAt: string; totalOrders: number; totalSpent: number; address: string }): CustomerListItem => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone || "",
  initials: getInitials(r.name),
  tier: deriveTier(r.totalSpent),
  totalOrders: r.totalOrders,
  totalSpent: r.totalSpent,
  address: r.address || "",
  registeredAt: formatDate(r.registeredAt),
});

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const records = await getCustomers();
      setCustomers(records.map(toCustomerListItem));
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { customers, refresh, loading };
}
