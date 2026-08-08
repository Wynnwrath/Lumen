import { useCallback, useEffect, useState } from "react";
import { getCoupons } from "../api/coupons";
import type { Coupon } from "../api/coupons";

// Deterministic sort so the list never reshuffles on refresh/toggle.
function sortCoupons(list: Coupon[]): Coupon[] {
  return [...list].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a._id < b._id ? 1 : -1;
  });
}

// Admin coupons list with refresh, matching the other admin data hooks.
export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setCoupons(sortCoupons(await getCoupons()));
    } catch (error) {
      console.error("Failed to load coupons", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic in-place update (e.g. toggle active without a full reload).
  const updateLocal = useCallback((updater: (prev: Coupon[]) => Coupon[]) => {
    setCoupons((prev) => sortCoupons(updater(prev)));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coupons, refresh, loading, updateLocal };
}
