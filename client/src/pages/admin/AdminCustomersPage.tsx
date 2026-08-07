import { useState } from "react";
import { Icon } from "../../components/common/Icon";
import type { CustomerListItem } from "../../types";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/skeletons";
import { AdminPagination } from "../../components/common/AdminPagination";
import { usePagination } from "../../hooks/usePagination";
import { useCustomers } from "../../hooks/useCustomers";
import { TierBadge } from "../../components/common/TierBadge";
import { formatMoney } from "../../utils/format";

// Admin customer directory: search, tier badges, order stats, profile modal.
export const AdminCustomersPage = () => {
  const { customers, loading: customersLoading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(filteredCustomers, 10);

  return (
    <div className="space-y-6">
      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex items-center gap-3 rounded-none">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by customer name or email..." />
      </div>

      {/* Customers Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {customersLoading ? (
        <LoadingSpinner label="Loading customers..." />
      ) : (
      <div className="space-y-4">
        {/* Mobile View: High-Density Customer Cards */}
        <div className="block md:hidden space-y-3">
          {filteredCustomers.length === 0 ? (
            <EmptyState message="No customers found matching your search." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
          ) : (
            paginated.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs rounded-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-extrabold text-sm shrink-0 border border-blue-200 dark:border-blue-800">
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                    </div>
                  </div>

                  <TierBadge tier={c.tier} />
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs rounded-none">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Lifetime Spend</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                      {formatMoney(c.totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Purchases</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {c.totalOrders} Orders
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Joined: {c.registeredAt}</span>
                  <Button variant="blue" size="sm" onClick={() => setSelectedCustomer(c)}>View Profile</Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Multi-Column Table (screen >= md) */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Tier Status</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredCustomers.length === 0 ? (
                  <EmptyState message="No customers found matching your search." className="py-12 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={6} />
                ) : (
                paginated.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {c.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <TierBadge tier={c.tier} />
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.totalOrders} Orders
                    </td>
                    <td className="p-4 font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(c.totalSpent)}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{c.registeredAt}</td>
                    <td className="p-4 text-right">
                      <Button variant="blue" size="sm" onClick={() => setSelectedCustomer(c)}>View Profile</Button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        start={start}
        end={end}
        onChange={setPage}
      />

      {/* 1-to-1 Customer Detailed Profile Modal (admin-customers.html parity) */}
      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? selectedCustomer.name : ""}
        subtitle={selectedCustomer ? selectedCustomer.email : undefined}
        icon={
          selectedCustomer ? (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-lg">
              {selectedCustomer.initials}
            </div>
          ) : undefined
        }
        headerIconClassName="w-11 h-11 rounded-full border-2 border-blue-600 overflow-hidden"
        className="max-w-2xl"
        footer={<Button onClick={() => setSelectedCustomer(null)}>Close Profile</Button>}
      >
        {selectedCustomer && (
          <>
            {/* Summary Stats Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Account Status
                </p>
                  <TierBadge tier={selectedCustomer.tier} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Total Orders
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Lifetime Spend
                </p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      {formatMoney(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>

            {/* Contact Info Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="badge" className="text-blue-600 text-sm" />
                <span>Contact & Address Info</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Phone Number:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Shipping Address:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Account Details */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="event" className="text-blue-600 text-sm" />
                <span>Account Registration</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Registered Date:</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.registeredAt}
                </p>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
