import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../api/coupons";
import type { Coupon } from "../../api/coupons";
import { getErrorMessage } from "../../api/client";
import { Icon } from "../../components/common/Icon";
import { Button } from "../../components/common/Button";
import { KpiCard } from "../../components/common/KpiCard";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/skeletons";
import { AdminPagination } from "../../components/common/AdminPagination";
import { RowActions } from "../../components/common/RowActions";
import { useToast } from "../../components/common/ToastProvider";
import { usePagination } from "../../hooks/usePagination";
import { formatDate } from "../../utils/format";

// Deterministic sort so the list never reshuffles on refresh/toggle.
const sortCoupons = (list: Coupon[]) =>
  [...list].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a._id < b._id ? 1 : -1;
  });

// Toggle switch used for a coupon's active state. Shows a spinner while saving.
const ToggleSwitch = ({ checked, onChange, disabled, loading }: { checked: boolean; onChange: () => void; disabled?: boolean; loading?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled || loading}
    className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors shrink-0 ${checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"} ${disabled || loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {loading ? (
      <span className="mx-auto">
        <Icon name="loader" className="text-xs animate-spin text-white" />
      </span>
    ) : (
      <span
        className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}`}
      />
    )}
  </button>
);

// Gradient discount badge reused on cards + table rows.
const DiscountBadge = ({ percent }: { percent: number }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-extrabold shadow-xs shrink-0">
    <Icon name="local_atm" className="text-sm" />
    -{percent}%
  </span>
);

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formPercent, setFormPercent] = useState(10);
  const [formActive, setFormActive] = useState(true);

  const loadCoupons = useCallback(async () => {
    try {
      setCoupons(sortCoupons(await getCoupons()));
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const filteredCoupons = useMemo(
    () =>
      coupons.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(c.discountPercent).includes(searchQuery)
      ),
    [coupons, searchQuery]
  );

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0);

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(filteredCoupons, 10);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormPercent(10);
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormPercent(coupon.discountPercent);
    setFormActive(coupon.isActive);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        code: formCode.trim(),
        discountPercent: Math.round(formPercent),
        isActive: formActive,
      };
      if (editingCoupon) {
        await updateCoupon(editingCoupon.code, payload);
        showToast(`Updated coupon "${formCode.trim().toUpperCase()}"`, "success");
      } else {
        await createCoupon(payload);
        showToast(`Created coupon "${formCode.trim().toUpperCase()}"`, "success");
      }
      setShowModal(false);
      await loadCoupons();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    if (togglingId) return;
    setTogglingId(coupon._id);
    // Optimistic flip: update in place so the list doesn't reload/rearrange.
    setCoupons((prev) =>
      sortCoupons(prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c)))
    );
    try {
      await updateCoupon(coupon.code, { isActive: !coupon.isActive });
      showToast(`${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}`, "info");
    } catch (error) {
      // Revert on failure.
      setCoupons((prev) =>
        sortCoupons(prev.map((c) => (c._id === coupon._id ? { ...c, isActive: coupon.isActive } : c)))
      );
      showToast(getErrorMessage(error), "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    try {
      await deleteCoupon(coupon.code);
      showToast(`Coupon "${coupon.code}" deleted`, "info");
      await loadCoupons();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Metrics Overview */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 w-full">
        <KpiCard
          label="Total Coupons"
          chip="All"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={coupons.length}
          subtext="Discount codes on file"
          id="stat-total-coupons"
        />
        <KpiCard
          label="Active Coupons"
          chip="Live"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={activeCount}
          valueClassName="text-emerald-600 dark:text-emerald-400"
          subtext="Redeemable at checkout"
          id="stat-active-coupons"
        />
        <KpiCard
          label="Total Usage"
          chip="Redemptions"
          chipClassName="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60"
          value={totalUsage}
          subtext="Times redeemed"
          id="stat-total-usage"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Search & Actions Bar */}
      <section className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by code or discount %..." id="coupon-search" />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <Button variant="blue" icon="add" onClick={handleOpenAddModal}>
            Add Coupon
          </Button>
        </div>
      </section>

      {/* Content: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {loading ? (
        <LoadingSpinner label="Loading coupons..." />
      ) : (
        <section className="space-y-4">
          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {filteredCoupons.length === 0 ? (
              <EmptyState message="No coupons found matching your search." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
            ) : (
              paginated.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center gap-3.5 transition-colors rounded-none"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/60">
                    <Icon name="loyalty" className="text-xl" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                        {coupon.code}
                      </span>
                      <RowActions
                        actions={[
                          { label: "Edit", icon: "edit", onClick: () => handleOpenEditModal(coupon) },
                          { label: coupon.isActive ? "Deactivate" : "Activate", icon: coupon.isActive ? "block" : "check", onClick: () => handleToggleActive(coupon) },
                          { label: "Delete", icon: "delete", danger: true, onClick: () => handleDelete(coupon) },
                        ]}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <DiscountBadge percent={coupon.discountPercent} />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {coupon.usageCount} uses
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch checked={coupon.isActive} onChange={() => handleToggleActive(coupon)} disabled={togglingId !== null} loading={togglingId === coupon._id} />
                        <span className={`text-[11px] font-bold ${coupon.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden rounded-none">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">Coupon Code</th>
                    <th className="px-5 py-4">Discount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Usage</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                  {filteredCoupons.length === 0 ? (
                    <EmptyState message="No coupons found matching your search." className="py-12 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={6} />
                  ) : (
                    paginated.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                              <Icon name="loyalty" className="text-lg" />
                            </div>
                            <span className="font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">{coupon.code}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <DiscountBadge percent={coupon.discountPercent} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <ToggleSwitch checked={coupon.isActive} onChange={() => handleToggleActive(coupon)} disabled={togglingId !== null} loading={togglingId === coupon._id} />
                            <span className={`text-xs font-bold ${coupon.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                              {coupon.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${coupon.usageCount > 0 ? "bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}>
                            {coupon.usageCount} {coupon.usageCount === 1 ? "use" : "uses"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          {formatDate(coupon.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <RowActions
                            actions={[
                              { label: "Edit", icon: "edit", onClick: () => handleOpenEditModal(coupon) },
                              { label: coupon.isActive ? "Deactivate" : "Activate", icon: coupon.isActive ? "block" : "check", onClick: () => handleToggleActive(coupon) },
                              { label: "Delete", icon: "delete", danger: true, onClick: () => handleDelete(coupon) },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        start={start}
        end={end}
        onChange={setPage}
      />

      {/* Add / Edit Coupon Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingCoupon ? "Edit Coupon" : "Add New Coupon"}
        subtitle={editingCoupon ? `Update "${editingCoupon.code}"` : "Create a discount code for customers"}
        icon={<Icon name="loyalty" className="text-xl" />}
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="blue" type="submit" form="coupon-form" disabled={saving}>
              {saving ? "Saving..." : "Save Coupon"}
            </Button>
          </>
        }
      >
        <form id="coupon-form" onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Coupon Code *</label>
            <div className="relative">
              <Icon name="loyalty" className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono font-bold uppercase rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Discount Percentage *</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={90}
                required
                value={formPercent}
                onChange={(e) => setFormPercent(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition"
              />
              <DiscountBadge percent={Math.min(90, Math.max(1, formPercent || 0))} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Between 1% and 90% off the subtotal.</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Active immediately</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Inactive coupons are rejected at checkout.</p>
            </div>
            <ToggleSwitch checked={formActive} onChange={() => setFormActive((v) => !v)} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
